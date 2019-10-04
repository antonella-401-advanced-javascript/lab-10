const tokenService = require('../token-service');

module.exports = () => (req, res, next) => {
  console.log(req.user)
  tokenService.sign(req.user)
    .then(payload => {
      if(payload.roles !== 'admin') {
        next({
          statusCode: 401,
          error: 'Role Not Authorized'
        });
        return;
      }
      next();
    });
};