document.getElementById("saveBtn").addEventListener("click", () => {
    alert("Your beat has been saved!");
    markComplete("💾 Save Music");
  });
  
  document.querySelectorAll(".dropdown input[type='file']").forEach(input => {
    input.addEventListener("change", () => {
      const label = input.closest(".dropdown").querySelector("summary").textContent.trim();
      markComplete(label);
    });
  });
  
  function markComplete(label) {
    document.querySelectorAll(".dropdown").forEach(dropdown => {
      const summaryText = dropdown.querySelector("summary").textContent.trim();
      if (summaryText === label) {
        dropdown.classList.add("completed");
      }
    });
  }
  