// const scriptSources = ["'self'", "'unsafe-inline'","'unsafe-eval'", "https://masterclass.diazfernando.es"];
// const scriptSources2 = ["'self'", "'unsafe-inline'", "https://masterclass.diazfernando.es"];
// const styleSources = ["'self'", "https:", "'unsafe-inline'", "https://masterclass.diazfernando.es"];
// const connectSources = ["'self'", "js.stripe.com", "https://masterclass.diazfernando.es"];
// const connectImgSrc = [ "'self'", "'unsafe-inline'", "https://masterclass.diazfernando.es"];

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: scriptSources,
//       scriptSrcElem: scriptSources,
//       styleSrc: styleSources,
//       connectSrc: connectSources,
//       imgSrc: connectImgSrc,
//       mediaSrc: connectImgSrc,
//       frameSrc: scriptSources2,
//       'frame-ancestors': ["'self'", "https://masterclass.diazfernando.es"],
//     }
//   })
// );