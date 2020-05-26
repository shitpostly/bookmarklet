(
  function () {
    var activeElement;
    // create shitpostly popup and ui
    let popupElement = document.createElement('DIV');
    popupElement.innerHTML = 'shitpostly – very good bookmarklet';
    popupElement.style = 'position:fixed;display:none;padding:1rem .5rem;background-color:#eee;box-shadow:0 0 8px #777;border-radius:0 0 6px 6px';
    document.body.appendChild(popupElement);

    popupElement.addEventListener( 'click', function (event) {
      activeElement.focus();
    } );

    // all elements that are somehow editable
    let inputElements = document.querySelectorAll('input[type=text], input:not([type]), textarea, *[contenteditable]:not([contenteditable=false])');
    // add onfocus event listener
    inputElements.forEach ( inputElement => inputElement.addEventListener( 'focus', function (event) {
      activeElement = event.target;

      //event.target.style.background = '#f0f';

      let position = event.target.getBoundingClientRect();

      popupElement.style.display = 'block';
      popupElement.style.left = position.left + 'px';
      popupElement.style.top = position.bottom + 'px';
    } ) );

    // add onblur (unfocus) event listener
    inputElements.forEach ( inputElement => inputElement.addEventListener( 'blur', function (event) {
      //popupElement.style.display = 'none';
    } ) );

    document.body.addEventListener ( 'click', function (event) {
      if (!inputElements.includes(event.target)) {
        popupElement.style.display = none;
      }
    } );
  }
)();
