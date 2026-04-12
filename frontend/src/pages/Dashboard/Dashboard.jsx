import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import pendingIcon from '../../assets/icons/Pendentes.svg';
import progressIcon from '../../assets/icons/EmAndamento.svg';
import completedIcon from '../../assets/icons/Concluídas.svg';
import completionRateIcon from '../../assets/icons/TaxaDeConclusão.svg';
import viewAllIcon from '../../assets/icons/VerTodas.svg';
import AppShell from '../../components/AppShell/AppShell';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem('agrotask_user') || '{}');
  const storedMembership = JSON.parse(
    localStorage.getItem('agrotask_membership') || '{}'
  );

  const [dashboardData, setDashboardData] = useState({
    summary: {
      totalTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0,
      lateTasks: 0,
      completionRate: 0,
    },
    productivity: {
      labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
      createdSeries: [0, 0, 0, 0, 0, 0],
      completedSeries: [0, 0, 0, 0, 0, 0],
      maxValue: 0,
    },
    recentTasks: [],
    user: storedUser,
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [chartTooltip, setChartTooltip] = useState(null);

  const userName = dashboardData.user?.name || storedUser.name || 'Usuário';
  const userRoleValue = dashboardData.user?.role || storedMembership.role;
  const userRole =
    userRoleValue === 'ADMIN' ? 'Administrador' : 'Funcionário';

  const handleLogout = () => {
    localStorage.removeItem('agrotask_token');
    localStorage.removeItem('agrotask_user');
    localStorage.removeItem('agrotask_farm');
    localStorage.removeItem('agrotask_membership');
    navigate('/', { replace: true });
  };

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setErrorMessage('');

        const response = await api.get('/dashboard/summary');

        const responseUser = response.data.user || storedUser;
        const responseFarm = response.data.farm || null;

        localStorage.setItem('agrotask_user', JSON.stringify(responseUser));

        if (responseFarm) {
          localStorage.setItem('agrotask_farm', JSON.stringify(responseFarm));
        }

        setDashboardData({
          summary: response.data.summary || {
            totalTasks: 0,
            pendingTasks: 0,
            inProgressTasks: 0,
            completedTasks: 0,
            lateTasks: 0,
            completionRate: 0,
          },
          productivity: response.data.productivity || {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
            createdSeries: [0, 0, 0, 0, 0, 0],
            completedSeries: [0, 0, 0, 0, 0, 0],
            maxValue: 0,
          },
          recentTasks: response.data.recentTasks || [],
          user: responseUser,
        });
      } catch (error) {
        const status = error.response?.status;
        const message =
          error.response?.data?.message ||
          'Não foi possível carregar o dashboard.';

        if (status === 401) {
          handleLogout();
          return;
        }

        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const summaryCards = useMemo(
    () => [
      {
        title: 'Pendentes',
        value: String(dashboardData.summary.pendingTasks ?? 0),
        className: 'dashboard-summary-card pending',
        icon: pendingIcon,
        iconAlt: 'Ícone de pendentes',
      },
      {
        title: 'Em andamento',
        value: String(dashboardData.summary.inProgressTasks ?? 0),
        className: 'dashboard-summary-card progress',
        icon: progressIcon,
        iconAlt: 'Ícone de em andamento',
      },
      {
        title: 'Concluídas',
        value: String(dashboardData.summary.completedTasks ?? 0),
        className: 'dashboard-summary-card completed',
        icon: completedIcon,
        iconAlt: 'Ícone de concluídas',
      },
      {
        title: 'Taxa de conclusão',
        value: `${dashboardData.summary.completionRate ?? 0}%`,
        className: 'dashboard-summary-card rate',
        icon: completionRateIcon,
        iconAlt: 'Ícone de taxa de conclusão',
      },
    ],
    [dashboardData.summary]
  );

  const overviewItems = useMemo(() => {
    const totalTasks = dashboardData.summary.totalTasks || 0;
    const pendingTasks = dashboardData.summary.pendingTasks || 0;
    const inProgressTasks = dashboardData.summary.inProgressTasks || 0;
    const completedTasks = dashboardData.summary.completedTasks || 0;

    const buildWidth = (value) => {
      if (!totalTasks || !value) {
        return '0%';
      }

      return `${Math.round((value / totalTasks) * 100)}%`;
    };

    return [
      {
        title: 'Pendentes',
        value: `${pendingTasks}/${totalTasks}`,
        colorClass: 'pending',
        width: buildWidth(pendingTasks),
      },
      {
        title: 'Em andamento',
        value: `${inProgressTasks}/${totalTasks}`,
        colorClass: 'progress',
        width: buildWidth(inProgressTasks),
      },
      {
        title: 'Concluídas',
        value: `${completedTasks}/${totalTasks}`,
        colorClass: 'completed',
        width: buildWidth(completedTasks),
      },
    ];
  }, [dashboardData.summary]);

  const getPriorityClass = (priorityKey) => {
    const priorityMap = {
      HIGH: 'high',
      MEDIUM: 'medium',
      LOW: 'low',
    };

    return priorityMap[priorityKey] || 'medium';
  };

  const getStatusClass = (statusKey) => {
    const statusMap = {
      PENDING: 'pending',
      IN_PROGRESS: 'progress',
      COMPLETED: 'completed',
      LATE: 'late',
    };

    return statusMap[statusKey] || 'pending';
  };

  const recentTasks = dashboardData.recentTasks.map((task) => ({
    ...task,
    priorityClass: getPriorityClass(task.priorityKey),
    statusClass: getStatusClass(task.statusKey),
  }));

  const chartData = useMemo(() => {
    const fallbackLabels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'];

    const labels =
      dashboardData.productivity?.labels?.length === 6
        ? dashboardData.productivity.labels
        : fallbackLabels;

    const createdValues =
      dashboardData.productivity?.createdSeries?.length === 6
        ? dashboardData.productivity.createdSeries.map((value) => Number(value) || 0)
        : [0, 0, 0, 0, 0, 0];

    const completedValues =
      dashboardData.productivity?.completedSeries?.length === 6
        ? dashboardData.productivity.completedSeries.map((value) => Number(value) || 0)
        : [0, 0, 0, 0, 0, 0];

    const rawMax = Math.max(
      ...createdValues,
      ...completedValues,
      Number(dashboardData.productivity?.maxValue) || 0,
      0
    );

    let chartMax = 4;

    if (rawMax > 4) {
      const step = Math.ceil(rawMax / 4);
      chartMax = step * 4;
    }

    const tickStep = chartMax / 4;
    const ticks = [chartMax, tickStep * 3, tickStep * 2, tickStep, 0];

    const width = 800;
    const height = 260;
    const leftPadding = 16;
    const rightPadding = 16;
    const topPadding = 16;
    const bottomPadding = 16;
    const usableWidth = width - leftPadding - rightPadding;
    const usableHeight = height - topPadding - bottomPadding;

    const getX = (index, total) =>
      leftPadding + (usableWidth / Math.max(total - 1, 1)) * index;

    const getY = (value) =>
      topPadding + usableHeight - (Math.min(value, chartMax) / chartMax) * usableHeight;

    const weekPoints = labels.map((label, index) => ({
      label,
      createdValue: createdValues[index] || 0,
      completedValue: completedValues[index] || 0,
      x: getX(index, labels.length),
      createdY: getY(createdValues[index] || 0),
      completedY: getY(completedValues[index] || 0),
    }));

    const createdPoints = weekPoints.map((point) => ({
      x: point.x,
      y: point.createdY,
      value: point.createdValue,
      label: point.label,
      seriesLabel: 'Criadas',
      seriesClass: 'created',
    }));

    const completedPoints = weekPoints.map((point) => ({
      x: point.x,
      y: point.completedY,
      value: point.completedValue,
      label: point.label,
      seriesLabel: 'Concluídas',
      seriesClass: 'completed',
    }));

    const buildLinePath = (points) => {
      if (!points.length) {
        return '';
      }

      return points
        .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`)
        .join(' ');
    };

    const buildAreaPath = (points) => {
      if (!points.length) {
        return '';
      }

      const linePath = buildLinePath(points);
      const lastPoint = points[points.length - 1];
      const firstPoint = points[0];
      const baselineY = getY(0);

      return `${linePath} L${lastPoint.x} ${baselineY} L${firstPoint.x} ${baselineY} Z`;
    };

    const tickObjects = ticks.map((tick) => {
      const y = getY(tick);

      return {
        value: Number.isInteger(tick) ? tick : Number(tick.toFixed(1)),
        y,
        topPercent: (y / height) * 100,
      };
    });

    return {
      labels,
      width,
      height,
      ticks: tickObjects,
      weekPoints,
      createdPoints,
      completedPoints,
      createdPath: buildLinePath(createdPoints),
      completedPath: buildLinePath(completedPoints),
      areaPath: buildAreaPath(completedPoints),
    };
  }, [dashboardData.productivity]);

  const showChartTooltip = (event, weekPoint) => {
    const plotElement = event.currentTarget.closest('.chart-plot');

    if (!plotElement) {
      return;
    }

    const plotRect = plotElement.getBoundingClientRect();
    const relativeX = event.clientX - plotRect.left;
    const relativeY = event.clientY - plotRect.top;

    const tooltipWidth = 190;
    const tooltipHeight = 108;
    const offset = 14;

    let left = relativeX + offset;
    let top = relativeY - tooltipHeight - offset;

    if (left + tooltipWidth > plotRect.width - 8) {
      left = relativeX - tooltipWidth - offset;
    }

    if (left < 8) {
      left = 8;
    }

    if (top < 8) {
      top = relativeY + offset;
    }

    setChartTooltip({
      left,
      top,
      weekLabel: weekPoint.label,
      createdValue: weekPoint.createdValue,
      completedValue: weekPoint.completedValue,
    });
  };

  const hideChartTooltip = () => {
    setChartTooltip(null);
  };

  return (
    <AppShell title="Dashboard" pageClassName="dashboard-page">
      <div className="dashboard-shell">
        <div className="dashboard-welcome">
          <h2>Bom dia, {userName.split(' ')[0]} 👋</h2>
          <p>
            Aqui está um resumo das operações de hoje — quinta-feira, 26 de
            março
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              marginBottom: '20px',
              padding: '14px 16px',
              borderRadius: '16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '0.95rem',
            }}
          >
            {errorMessage}
          </div>
        )}

        <section className="dashboard-summary-grid">
          {summaryCards.map((card) => (
            <article key={card.title} className={card.className}>
              <div className="dashboard-summary-info">
                <span>{card.title}</span>
                <strong>{loading ? '--' : card.value}</strong>
              </div>

              <div className="dashboard-summary-icon">
                <img
                  src={card.icon}
                  alt={card.iconAlt}
                  className="dashboard-summary-icon-img"
                />
              </div>
            </article>
          ))}
        </section>

        <section className="dashboard-chart-card">
          <div className="dashboard-chart-header">
            <h3>Produtividade</h3>
            <p>Tarefas criadas vs. concluídas por semana</p>
          </div>

          <div className="dashboard-chart-area">
            <div className="chart-y-axis">
              {chartData.ticks.map((tick) => (
                <span
                  key={`tick-${tick.value}`}
                  style={{ top: `${tick.topPercent}%` }}
                >
                  {tick.value}
                </span>
              ))}
            </div>

            <div className="chart-content">
              <div className="chart-plot" onMouseLeave={hideChartTooltip}>
                <div className="chart-grid-lines">
                  {chartData.ticks.map((tick) => (
                    <span
                      key={`grid-${tick.value}`}
                      style={{ top: `${tick.topPercent}%` }}
                    />
                  ))}
                </div>

                <svg
                  className="chart-svg"
                  viewBox={`0 0 ${chartData.width} ${chartData.height}`}
                  preserveAspectRatio="none"
                >
                  <path d={chartData.areaPath} className="chart-area-fill" />

                  <path
                    d={chartData.createdPath}
                    fill="none"
                    className="line-created"
                  />

                  <path
                    d={chartData.completedPath}
                    fill="none"
                    className="line-completed"
                  />

                  {chartData.createdPoints.map((point, index) => (
                    <circle
                      key={`created-point-${point.label}-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r="5"
                      className="chart-point created"
                    />
                  ))}

                  {chartData.completedPoints.map((point, index) => (
                    <circle
                      key={`completed-point-${point.label}-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r="5"
                      className="chart-point completed"
                    />
                  ))}

                  {chartData.weekPoints.map((weekPoint, index) => {
                    const hoverY = Math.min(
                      weekPoint.createdY,
                      weekPoint.completedY
                    );
                    const hoverHeight =
                      Math.abs(weekPoint.createdY - weekPoint.completedY) + 32;

                    return (
                      <rect
                        key={`hover-week-${weekPoint.label}-${index}`}
                        x={weekPoint.x - 24}
                        y={Math.max(0, hoverY - 16)}
                        width="48"
                        height={hoverHeight}
                        rx="12"
                        className="chart-week-hitbox"
                        onMouseEnter={(event) => showChartTooltip(event, weekPoint)}
                        onMouseMove={(event) => showChartTooltip(event, weekPoint)}
                      />
                    );
                  })}
                </svg>

                {chartTooltip && (
                  <div
                    className="chart-custom-tooltip"
                    style={{
                      left: `${chartTooltip.left}px`,
                      top: `${chartTooltip.top}px`,
                    }}
                  >
                    <div className="chart-custom-tooltip-week">
                      {chartTooltip.weekLabel}
                    </div>

                    <div className="chart-custom-tooltip-metrics">
                      <div className="chart-custom-tooltip-row">
                        <span className="chart-custom-tooltip-dot created" />
                        <span className="chart-custom-tooltip-label">Criadas</span>
                        <strong className="chart-custom-tooltip-number">
                          {chartTooltip.createdValue}
                        </strong>
                      </div>

                      <div className="chart-custom-tooltip-row">
                        <span className="chart-custom-tooltip-dot completed" />
                        <span className="chart-custom-tooltip-label">Concluídas</span>
                        <strong className="chart-custom-tooltip-number">
                          {chartTooltip.completedValue}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="chart-x-axis">
                {chartData.labels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-chart-legend">
            <div className="legend-item">
              <span className="legend-dot created" />
              <span>Criadas</span>
            </div>

            <div className="legend-item">
              <span className="legend-dot completed" />
              <span>Concluídas</span>
            </div>
          </div>
        </section>

        <section className="dashboard-overview-card">
          <div className="dashboard-overview-header">
            <h3>Visão geral</h3>
          </div>

          <div className="dashboard-overview-progress-top">
            <div className="dashboard-overview-progress-label-row">
              <span>Progresso geral</span>
              <strong>
                {loading ? '--' : `${dashboardData.summary.completionRate ?? 0}%`}
              </strong>
            </div>

            <div className="dashboard-progress-track large">
              <div
                className="dashboard-progress-fill completed"
                style={{
                  width: loading
                    ? '0%'
                    : `${dashboardData.summary.completionRate ?? 0}%`,
                }}
              />
            </div>
          </div>

          <div className="dashboard-overview-list">
            {overviewItems.map((item) => (
              <div
                className="dashboard-overview-item"
                key={`${item.title}-${item.value}`}
              >
                <div className="dashboard-overview-item-header">
                  <div className="dashboard-overview-item-title">
                    <span className={`overview-dot ${item.colorClass}`} />
                    <span>{item.title}</span>
                  </div>

                  <strong>{loading ? '--/--' : item.value}</strong>
                </div>

                <div className="dashboard-progress-track">
                  <div
                    className={`dashboard-progress-fill ${item.colorClass}`}
                    style={{ width: loading ? '0%' : item.width }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-overview-total">
            <span>Total de tarefas</span>
            <strong>{loading ? '--' : dashboardData.summary.totalTasks ?? 0}</strong>
          </div>
        </section>

        <section className="dashboard-recent-card">
          <div className="dashboard-recent-header">
            <h3>Tarefas recentes</h3>
            <Link to="/tasks" className="dashboard-recent-link">
              <span>Ver todas</span>
              <img src={viewAllIcon} alt="" className="dashboard-recent-link-icon" />
            </Link>
          </div>

          <div className="dashboard-recent-list">
            {!loading && recentTasks.length === 0 && (
              <div className="dashboard-recent-empty">
                Nenhuma tarefa recente encontrada.
              </div>
            )}

            {recentTasks.map((task) => (
              <article
                className="dashboard-task-row"
                key={task.id}
                onClick={() => navigate(`/task-details/${task.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="dashboard-task-main">
                  <h4>{task.title}</h4>
                  <p>{task.subtitle}</p>
                </div>

                <div className="dashboard-task-meta">
                  <span className={`task-pill priority ${task.priorityClass}`}>
                    {task.priority}
                  </span>

                  <span className={`task-pill status ${task.statusClass}`}>
                    <span className="task-status-dot" />
                    {task.status}
                  </span>

                  <span className="dashboard-task-date">
                    {task.date || '--/--/----'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default Dashboard;