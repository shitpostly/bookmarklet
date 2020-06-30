(
  function () {
    /// define patterns for valid sentences
    let validSentences = [];
    fetch('https://raw.githubusercontent.com/shitpostly/bookmarklet/master/sentences.txt')
      .then(response => response.text())
      .then((data) => {
        validSentences = data.split('\n')
      });

    // get active element
    let element = document.activeElement;
    let isContentEditable = element.contentEditable == 'true';
    // if active element is any form of input element
    if (element.nodeName == 'INPUT' || element.nodeName == 'TEXTAREA' || isContentEditable) {
      element.classList.add('shitpostly-container');
      element.addEventListener( 'keyup', function (event) {
        // ignore special keys
        if (event.keyCode < 33 || event.keycode == 224) return;

        // try to autocomplete
        let completed = spcomplete(spinputvalue());
        if (completed) {
          let selectionStart = spinputvalue().length;
          // insert autocompleted text into input field
          spsetvalue(spinputvalue().trim() + completed);
          let selectionEnd = spinputvalue().length;
          // select autocompleted part so the user can continue typing normally
          if (isContentEditable) {
            let textNode = element.childNodes[0];
            let range = document.createRange();
            range.setStart(textNode, selectionStart);
            range.setEnd(textNode, selectionEnd);
            let selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            element.setSelectionRange(selectionStart, selectionEnd);
          }
        }
      } );
    }

    // style the autocompleted text
    let styleNode = document.createElement('STYLE');
    styleNode.innerHTML = '.shitpostly-container::selection{color:#fff;background-color:#2bb673}';
    document.head.appendChild(styleNode);

    /// returns value of the current input element
    function spinputvalue () {
      if (!isContentEditable) return element.value;
      return element.innerText;
    }

    /// sets the value of the current input element
    function spsetvalue (value) {
      if (!isContentEditable) {
        element.value = value;
      } else {
        element.innerText = value;
      }
    }


    /// autocomplete a string
    function spcomplete (string) {
      if (!string) return;

      // we only want to look at the very last line
      let lines = string.split('\n');
      let lastLine = lines[lines.length - 1];

      // try if one of our predefined sentences matches with what is already typed
      for (let i = 0; i < validSentences.length; i ++) {
        let s = validSentences[i];

        // check if the string matches the sentence;
        // we're continuing to add one character until the sentence is matched or we
        let parts = s.split('');
        let regex = '';
        for (let j = 0; j < parts.length; j ++) {
          // add the next character
          regex += parts[j];
          try {
            // make the regex executable
            // this can be a problem, e.g. when the regex (a word|another word) gets divided
            // somewhere in the middle because the string we want to complete is 'anot' –
            // the regex part that would match this would be '(a word|anot', which is missing
            // a closing bracket. `level` would be 1 in this case (level means amount of unmatched
            // left brackets) and we'd need to add a closing bracket to make it a valid regex.
            let level = spoccures(regex, /\(/g) - spoccures(regex, /\)/g);
            let fixedRegex = regex + ')'.repeat(level);
            // if the sentence is matched, we'll return the missing part of the sentence
            if (lastLine.trim().toLowerCase().match('^' + fixedRegex.trim().toLowerCase() + '$')) {
              // calling spresolve here, to get rid of regex syntax and suggest a single complete
              // sentence to the user
              return spresolve(s.substr(j + 1));
            }
          } catch (e) {
            // syntax error somewhere in the regex, we don't need to worry about this since
            // this means we've stopped at a character that's impossible to type anyway
          }
        }
      }
    }

    // helper function, counts occurances of `regex` in `string`
    // usage: `spoccures('this is a string', /s/g)`
    // > will count occurances of 's' in 'this is a string'; the `g` is needed to match all occurances
    function spoccures(string, regex) {
      return (string.match(regex) || []).length;
    }

    // resolves the regex syntax of the sentences and makes it human-readable
    function spresolve(string) {
      if (!string) return;

      let resolved = '';
      /// amount of unmatched left brackets
      let level = 0
      /// remember levels we need to skip to
      // this is needed when there's nested optionals (e.g. `(a(b|c)|d)`, in this case
      // we want to resolve to 'ab', therefor we need to skip the `c` and the `d`, which
      // is why we need a queue to keep track of the brackets we want to skip to)
      let skipToQueue = [];
      // iterate through the string and remove any unneeded characters
      for (let i = 0; i < string.length; i ++) {
        switch(string[i]) {
          case '(':
          level ++;
          break;
          case ')':
          level --;
          // since we've reached a closing bracket, we can now remove it from the skip queue
          if (skipToQueue.includes(level)) {
           skipToQueue.splice(skipToQueue.indexOf(level), 1);
          }
          break;
          case '|':
          // determine the bracket level we want to skip to and add that level to the queue
          if (!skipToQueue.includes(level - 1)) {
            skipToQueue.push(level - 1);
          }
          break;
          case '?':
          // always suggest optionals; this is easier to implement and probably a useful feature
          case '\\':
          // we don't want any escape sequence visible
          break;
          default:
          // if we don't want to skip the current character, we add it to the resolved string
          if (skipToQueue.length == 0) {
            resolved += string[i];
          }
        }
      }

      return resolved;
    }
  }
)();
