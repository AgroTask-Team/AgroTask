function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        message: 'Usuário não autenticado.',
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: 'Você não tem permissão para acessar este recurso.',
      });
    }

    return next();
  };
}

function requireAdmin(req, res, next) {
  const userRole = req.user?.role;

  if (!userRole) {
    return res.status(401).json({
      message: 'Usuário não autenticado.',
    });
  }

  if (userRole !== 'ADMIN') {
    return res.status(403).json({
      message: 'Apenas administradores podem realizar esta ação.',
    });
  }

  return next();
}

module.exports = {
  requireRole,
  requireAdmin,
};