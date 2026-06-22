let nodemailer =
require("nodemailer");
let transporter = nodemailer.createTransport({
    service:"gmail",

    auth:{
        user:process.env.EMAIL,
        pass:process.env.APP_PASSWORD
    }

});

let sendloginmail =async(email,username)=>{

   let date =
   new Date();

   let options = {
      from:process.env.EMAIL,
      to:email,
      subject:
      "PandaChat Login Alert",
      html:`
      <h2>Hello ${username}</h2>
      <p>
      Your PandaChat account
      was logged in successfully.
      </p>
      <p>
      Date:
      ${date.toLocaleDateString(
         "en-IN"
      )}
      </p>

      <p>
      Time:
      ${date.toLocaleTimeString(
         "en-IN",
         {
            timeZone:
            "Asia/Kolkata"
         }
      )}
      IST
      </p>

      <p>
      If this was not you,
      please change your password.
      </p>

      `
   };

   await transporter.sendMail(
      options
   );

}

module.exports ={transporter,sendloginmail}