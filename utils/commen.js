const nodemailer = require('nodemailer');

async function sendOtpEmail(to, otp, name) {
  try {
    let subject = 'Sending Login Otp Email!';
    let html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
<div style="margin:50px auto;width:70%;padding:20px 0">
  <div style="border-bottom:1px solid #eee">
    <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Your Brand</a>
  </div>
  <p style="font-size:1.1em">Dear ${name || "Customer"},</p>
  <p>Thank you for choosing Your Brand. Use the following OTP to complete your Sign In procedures. OTP is valid for 5 minutes</p>
  <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
  <p style="font-size:0.9em;">Regards,<br />Your Brand</p>
  <hr style="border:none;border-top:1px solid #eee" />
  <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
    <p>Your Brand Inc</p>
    <p>1600 Amphitheatre Parkway</p>
    <p>California</p>
  </div>
</div>
</div>`
    return await SendEmail(to, subject, html).catch(err => { console.error(err); return null })
  } catch (error) {
    console.error('issue in send otp email: ', error);
    throw error
  }
}

async function sendRegisterEmailEmail(to, url, name) {
  try {
    let subject = 'Sending Registration Email!';
    let html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
<div style="margin:50px auto;width:70%;padding:20px 0">
  <div style="border-bottom:1px solid #eee">
    <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Your Brand</a>
  </div>
  <p style="font-size:1.1em">Hello  ${name || "Customer"},</p>
  <p>You registered an account ${to}, before being able to use your account you need to verify that this is your email address by</p>
  <p>clicking here: <a href="${url}">Click Here</a></p>
  <p style="font-size:0.9em;">Regards,<br />Your Brand</p>
  <hr style="border:none;border-top:1px solid #eee" />
  <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
    <p>Your Brand Inc</p>
    <p>1600 Amphitheatre Parkway</p>
    <p>California</p>
  </div>
</div>
</div>`
    return await SendEmail(to, subject, html).catch(err => { console.error(err); return null })
  } catch (error) {
    console.error('issue in send otp email: ', error);
    throw error
  }
}

async function SendEmail(to, subject, html) {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    let mailOptions = {
      from: process.env.EMAIL_FROM,
      to: to,
      subject: subject,
      html: html
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) { console.error('issue in sendMail send otp email: ', error); }
      else {
        console.log('Email sent: ' + info.response);
        return info
      }
    });
  } catch (error) {
    console.error('issue in SendEmail: ', error);
    throw error
  }
}

module.exports = { sendOtpEmail, sendRegisterEmailEmail }