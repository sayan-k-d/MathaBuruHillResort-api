const { Queries } = require("../models/Queries");
const { GeneralInfo } = require("../models/GeneralInfo");
const sgMail = require("@sendgrid/mail");
const env = require("dotenv");
env.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.submitQueries = async (req, res) => {
  let queries = await new Queries({
    name: req.body.name,
    email: req.body.email,
    query: req.body.query,
  }).save();
  let generalInfo = await GeneralInfo.findOne({});
  let contacts = generalInfo.contacts;
  await sendUserQueryEmail(queries, contacts);
  res.send(queries);
};

//send queries email
const sendUserQueryEmail = async (queries, { mobile, email }) => {
  const mailOptions = {
    to: queries.email,
    from: process.env.ADMIN_EMAIL,
    subject: "Response to Your Enquiry",
    html: `
    <html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Response to Your Query</title>
</head>
<body>
  <h2>Dear ${queries.name},</h2>
  
  <p>Thank you for reaching out to us. We appreciate your interest in our services.</p>
  <p> We have received your inquiry  and our team will get back to you as soon as possible regarding your query.</p>
  
  <p>In the meantime, if you have any further questions or concerns, feel free to contact us at any time directly at ${email} or ${mobile}</p>

  <p>Best regards,<br>
  <strong>Matha Buru Hill Eco Resort</strong></p>
</body>
</html>
    `,
  };

  sgMail
    .send(mailOptions)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};
