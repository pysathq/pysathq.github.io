//Preloader
$(window).on('load', function() { // makes sure the whole site is loaded
    $('#status').fadeOut(); // will first fade out the loading animation
    $('#preloader').delay(350).fadeOut('slow'); // will fade out the white DIV that covers the website. 
    $('body').delay(350).css({'overflow':'visible'});
})

$(document).ready(function(){
    //Mobile menu toggle
    if ($('.navbar-burger').length) {
        $('.navbar-burger').on("click", function(){

            var menu_id = $(this).attr('data-target');
            $(this).toggleClass('is-active');
            $("#"+menu_id).toggleClass('is-active');
            $('.navbar.is-light').toggleClass('is-dark-mobile')
        });
    }

    //reveal elements on scroll so animations trigger the right way
    var $window           = $(window),
        win_height_padded = $window.height() * 1.1;

    $window.on('scroll', revealOnScroll);

    function revealOnScroll() {
        var scrolled = $window.scrollTop();
        $(".revealOnScroll:not(.animated)").each(function () {
            var $this     = $(this),
                offsetTop = $this.offset().top;

            if (scrolled + win_height_padded > offsetTop) {
                if ($this.data('timeout')) {
                    window.setTimeout(function(){
                        $this.addClass('animated ' + $this.data('animation'));
                    }, parseInt($this.data('timeout'),10));
                } else {
                    $this.addClass('animated ' + $this.data('animation'));
                }
            }
        });
    }

    // Back to Top button behaviour
    var pxShow = 600;
    var scrollSpeed = 500;
    $(window).on("scroll", function() {
        if ($(window).scrollTop() >= pxShow) {
            $("#backtotop").addClass('visible');
        } else {
            $("#backtotop").removeClass('visible');
        }
    });
    $('#backtotop a').on('click', function() {
        $('html, body').animate({
            scrollTop: 0
        }, scrollSpeed);
        return false;
    });

    // Select all links with hashes
    $('a[href*="#"]')
    // Remove links that don't actually link to anything
        .not('[href="#"]')
        .not('[href="#0"]')
        .on("click", function(event) {
        // On-page links
        if (
            location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
            &&
            location.hostname == this.hostname
        ) {
            // Figure out element to scroll to
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            // Does a scroll target exist?
            if (target.length) {
                // Only prevent default if animation is actually gonna happen
                event.preventDefault();
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 550, function() {
                    // Callback after animation
                    // Must change focus!
                    var $target = $(target);
                    $target.focus();
                    if ($target.is(":focus")) { // Checking if the target was focused
                        return false;
                    } else {
                        $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
                        $target.focus(); // Set focus again
                    };
                });
            }
        }
    });
})

;
// throttle function, enforces a minimum time interval
function throttle(fn, interval) {
    var lastCall, timeoutId;
    return function () {
        var now = new Date().getTime();
        if (lastCall && now < (lastCall + interval) ) {
            // if we are inside the interval we remove
            // the existing timer and set up a new one
            clearTimeout(timeoutId);
            timeoutId = setTimeout(function () {
                lastCall = now;
                fn.call();
            }, interval - (now - lastCall) );
        } else {
            // otherwise, we directly call the function
            lastCall = now;
            fn.call();
        }
    };
}

// Highlight currently scrolled to header in shortcuts
// Based on https://stackoverflow.com/a/32396543/214686
// and
// https://stackoverflow.com/a/57494988/214686
// which fixes some issues with the first, particularly
// around scrolling upward.
function scrollHeadersAndNavbar() {
  var scrollPosition = $(window).scrollTop();
  var headers = $(":header[id]");
  var allShortcuts = $('#shortcuts > div');

  //Navbar Clone
  if (scrollPosition > 50) {
    $("#navbar-clone").addClass('is-active');
  } else{
    $("#navbar-clone").removeClass('is-active');
  }

  headers.each(function() {
    var currentSection = $(this);
    // get the position of the section
    var sectionTop = currentSection.position().top;
    var sectionHeight = currentSection.height();
    var overall = scrollPosition + sectionHeight;
    var headerOffset = remToPx(4);

    if (scrollPosition < headerOffset) {
      allShortcuts.removeClass('active');
      return false;
    }

    // user has scrolled over the top of the section
    if (((scrollPosition + headerOffset) >= sectionTop) && (scrollPosition < overall)) {
      var id = currentSection.attr('id');
      var shortcut = $(`#${id}-shortcut`);
      if (shortcut.length && !shortcut.hasClass('active')) {
        allShortcuts.removeClass('active');
        shortcut.addClass('active');
      }
    }
  });
}

function bindScroll() {
  $(window).scroll(throttle(scrollHeadersAndNavbar, 100));
}

function unbindScroll() {
  $(window).unbind('scroll');
}

function remToPx(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function setupShortcuts(shortcutDepth=2) {
  shortcutDepth += 1; // to account for the page title

  // Build a string like ".content-container h2, .content-container h3"
  let classes = '';
  for (let i = 2; i <= shortcutDepth; i++) {
    if (i != 2) {
      classes += ',';
    }
    classes += ' .content-container h' + i;
  }

  // Content Page Shortcuts
  const shortcutsTarget = $('#shortcuts');
  if (shortcutsTarget.length > 0) {
    $(classes).map(function(idx, el) {
      const title = el.textContent;
      const elId = el.id;
      // Gets the element type (e.g. h2, h3)
      const elType = $(el).get(0).tagName;
      // Adds snake-case title as an id attribute to target element
      shortcutsTarget.append(`<div id="${elId}-shortcut" class="shortcuts-${elType}" href="#${elId}">${title}</div>`);

      const shortcut = $(`#${elId}-shortcut`);
      shortcut.click(function() {
        // We don't want the shortcuts to flash through highlights while
        // we scroll to the desired header
        unbindScroll();

        // Replace what's in the location bar, without changing browser history
        // and without triggering a page scroll
        history.replaceState(null, null, `#${elId}`);

        let distance = $(`#${elId}`).offset().top-60;
        $([document.documentElement, document.body]).animate({
          scrollTop: distance,
        }, 300, null, function() {
          $('#shortcuts > div').removeClass('active');
          shortcut.addClass('active');

          // Done moving to clicked header; re-enable
          // scroll highlighting of shortcuts
          bindScroll();
        });
      });
    });
  }

  // Removes the shortcuts container if no shortcuts exist.
  // Also removes the 'Get Help' link.
  if ($('#shortcuts div').length < 1) {
    $('.shortcuts-container').css('display', 'none');
  }

  bindScroll();
}
