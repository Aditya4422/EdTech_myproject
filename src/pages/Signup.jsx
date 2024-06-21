import React from 'react';
import Template from '../components/core/Auth/Template';
import signupImg from '../assets/Images/signup.webp';
function Signup() {
  return (
    <Template
        title={"Join the millions learning to code with this platform for free"}
        description1={"Build skills for today, tommorow and beyond"}
        description2={"Education to future-proof your carrer"}
        image={signupImg}
        formType={"signup"}
    />
  )
}

export default Signup