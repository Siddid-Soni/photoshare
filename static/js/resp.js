burger = document.querySelector('#menu')
navbar = document.querySelector('.navbar')
nav = document.getElementsByClassName('nav-itm') 


burger.addEventListener('click', async ()=>{
    navbar.classList.toggle('h-nav')
     for (var i = 0; i < nav.length; i++) {
        // nav[i].classList.toggle('v-hid');
        nav[i].classList.toggle('anime')
       
    }
})