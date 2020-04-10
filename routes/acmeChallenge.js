module.exports = (app) => {
  app
    .route(`/.well-known/acme-challenge/${process.env.A_STRING}`)
    .get((req, res) => {
      return res.status(200).send(process.env.A_CHALLENGE);
    });
};
