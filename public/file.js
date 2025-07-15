let phoneGlobal = "";
let isOtpVerified = false;
let cooldownInterval = null;

document.addEventListener("DOMContentLoaded", () => {
  
    // Send OTP
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  if (sendOtpBtn) {
    sendOtpBtn.addEventListener("click", async (e) => {
      e.preventDefault();  // prevent form reload

      const phone = document.getElementById("number").value;

      // Validation
      if (!phone) {
        alert("Mobile number is required!");
        return;
      }

      if (!/^\d{10}$/.test(phone)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
      }

      const res = await fetch("http://localhost:5000/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      alert(data.message);
      if (data.success) {
        phoneGlobal = phone;
        isOtpVerified = false;
        otpAttempts = 0;
         verifyOtpBtn.disabled = false;

          if (cooldownInterval) clearInterval(cooldownInterval);

        const existingCooldown = document.getElementById("cooldownMsg");
    if (existingCooldown) existingCooldown.remove();

    verifyOtpBtn.textContent = "Verify OTP";
    document.getElementById("otp").value = "";
      }
    });
  }

  // Verify OTP
let otpAttempts = 0;
const MAX_ATTEMPTS = 3;

  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  
  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const otp = document.getElementById("otp").value;

      if (!phoneGlobal) {
      alert("Please send OTP first.");
      return;
      }
       if (!otp) {
      alert("Please enter the OTP.");
      return;
    }      
const res = await fetch("http://localhost:5000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneGlobal, otp }),
      });

      const data = await res.json();
      
      if (data.cooldown) {
      disableVerifyBtn(data.retryAfter || 10); // fallback to 10 seconds
      alert("Retry after 10 seconds");
      return;
    }

      if (data.success) {
        isOtpVerified = true;
        otpAttempts = 0;
        alert("Verified successfully!");

        const resetBtn = document.getElementById("resetBtn");
        if (resetBtn) resetBtn.disabled = false;
    
      } 
      else {
         otpAttempts++;
          if (otpAttempts === MAX_ATTEMPTS) {
        alert("Too many attempts. Please wait 10 seconds.");
        disableVerifyBtn(10); // Start 10s cooldown
        otpAttempts = 0;
      }
      else {
          alert("Wrong OTP. Try again.");
        }
    }
    });
  }
  // Cooldown function
function disableVerifyBtn(seconds) {
  let timeLeft = seconds;
  verifyOtpBtn.disabled = true;

  const originalText = verifyOtpBtn.textContent;

   if (cooldownInterval) clearInterval(cooldownInterval);

  // Create or use a message element to show countdown
  let cooldownMsg = document.getElementById("cooldownMsg");
  if (!cooldownMsg) {
    cooldownMsg = document.createElement("p");
    cooldownMsg.id = "cooldownMsg";
    verifyOtpBtn.parentNode.insertBefore(cooldownMsg, verifyOtpBtn.nextSibling);
  }

  // Start countdown
   cooldownInterval = setInterval(() => {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    cooldownMsg.style.color = "red";
    cooldownMsg.textContent = `Try again in ${min}:${sec < 10 ? "0" : ""}${sec}`;
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(cooldownInterval);
      verifyOtpBtn.disabled = false;
      verifyOtpBtn.textContent = originalText;
      cooldownMsg.innerHTML = `<span style="color: green;">Cooldown over. Please click 'Send OTP' again.</span>`;
      otpAttempts = 0;
      document.getElementById("otp").value = "";
    }
  }, 1000);
}

// Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const identifier = document.getElementById("identifier").value;
      const password = document.getElementById("security").value;

      try {
        const response = await fetch("http://localhost:5000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Login successful!");
          localStorage.setItem("token", data.token);
          window.location.href = "https://www.linkedin.com/in/nitin-singh-rawat-9594b228b";
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong!");
      }
    });
  }


// Signup click button 
    const signUpBtn = document.getElementById('SignUp');
    if(signUpBtn) {
    signUpBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      console.log("✅ Button Clicked");

      const data = {
        Fname: document.getElementById("fname").value,
        Lname: document.getElementById("Lname").value,
        address: document.getElementById("address").value,
        landmark: document.getElementById("landmark").value,
        pincode: document.getElementById("pincode").value,
        email: document.getElementById("email").value,
        number: document.getElementById("number").value,
        password: document.getElementById("password").value,
        Confirm_password: document.getElementById("Confirm_password").value,
      };

      console.log("📦 Sending Data:", data);

      try {
        const res = await fetch("http://localhost:5000/api/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await res.json();
        alert(result.message || result.error);

        if (result.success) {
        setTimeout(() => {
        window.location.href = "login.html";  
      }, 1000);
    }
      } catch (err) {
        console.error("❌ Error in request:", err);
        alert("Something went wrong");
      }
    });
    }

  //Reset Button
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
     resetBtn.disabled = true;
  resetBtn.addEventListener("click", (e) => {
     e.preventDefault();

    if (!isOtpVerified) {
      alert("Please verify OTP before resetting password.");
      return;
    }
    const numberInput = document.getElementById("number");
    const otpInput = document.getElementById("otp");

    if (!numberInput || !otpInput) {
      alert("Phone number and OTP are required!")
      return;
    }

    alert("Reset password successfully!");
    document.getElementById("passwordSection").style.display = "block";
    document.getElementById("resetBtn").style.display = "none";
  });
}


// Change password button
const changeBtn = document.getElementById("changePasswordBtn");
if (changeBtn) {
  changeBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById("new_password").value;
    const confirmPassword = document.getElementById("confirm_password").value;

    if (!isOtpVerified || !phoneGlobal) {
      alert("Please verify OTP first.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      alert("Both password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const res = await fetch("http://localhost:5000/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneGlobal, newPassword }),
    });

    const data = await res.json();
    alert(data.message);

    if (data.success) {
      window.location.href = "login.html";
    }
    numberInput.value = "";
    otpInput.value = "";
  });
}

});
