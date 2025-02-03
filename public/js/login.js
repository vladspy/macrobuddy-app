document.addEventListener('DOMContentLoaded', () => {
   const toggleButtons = document.querySelectorAll('.toggle');
   const signupForm = document.getElementById('signupForm');
   const signinForm = document.getElementById('signinForm');

   signupForm.style.display = 'none';
   signinForm.style.display = 'block';
   
   toggleButtons.forEach(button => {
       button.addEventListener('click', () => {
           const targetForm = button.dataset.form;
           //signinForm.innerHTML+="<p>First Name</p>"
           //signinForm.innerHTML+="<p>Last Name</p>"

           if (targetForm === 'signup') {
               signupForm.style.display = 'block';
               signinForm.style.display = 'none';
           } else if (targetForm === 'signin') {
               signupForm.style.display = 'none';
               signinForm.style.display = 'block';
           }
       });
   });
});