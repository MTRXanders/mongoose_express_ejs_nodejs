const nodemailer = require('nodemailer');
const config = require('../config');
const ejs = require('ejs'); 
const fs = require('fs');



module.exports = function(email, subject, viewPath, data) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 587,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_USER_PASS
    },
  });

  let objectMessage =  {
    from: '"<Uinflow.com>"',
    to: email,
    subject: subject,
  };
  //use template
   let compiled = ejs.compile(fs.readFileSync(viewPath,'utf8'));
   objectMessage.html = compiled(data); 

  transporter.sendMail(objectMessage,(err, info) => {
      if (err) {
        console.log(err);
      }
      if (info) {
        console.log(info);
      }
    }
  );
};
