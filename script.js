document.addEventListener('DOMContentLoaded', function () {
  var burger = document.querySelector('.burger');
  var navRight = document.querySelector('.nav-right');
  var overlay = document.querySelector('.overlay');
  var backBtn = document.querySelector('.back-to-top');
  var reveals = document.querySelectorAll('.reveal');

  burger.addEventListener('click', function () {
    navRight.classList.toggle('open');
    overlay.classList.toggle('show');
  });

  overlay.addEventListener('click', function () {
    navRight.classList.remove('open');
    overlay.classList.remove('show');
  });

  navRight.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navRight.classList.remove('open');
      overlay.classList.remove('show');
    });
  });

  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      backBtn.classList.add('show');
    } else {
      backBtn.classList.remove('show');
    }
  });

  backBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

  reveals.forEach(function (el) {
    observer.observe(el);
  });

  document.querySelectorAll('.grid-item').forEach(function (item) {
    item.addEventListener('mousemove', function (e) {
      var rect = item.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      var img = item.querySelector('img');
      img.style.transform = 'scale(1.05) translate(' + (x * -8) + 'px, ' + (y * -8) + 'px)';
    });

    item.addEventListener('mouseleave', function () {
      var img = item.querySelector('img');
      img.style.transform = '';
    });
  });
});
