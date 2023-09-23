document.addEventListener("DOMContentLoaded", function () {
  const chatMessages = document.getElementById("chat-messages");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");

  // Function to add a message to the chat
  function addMessage (sender, message) {
    const messageElement = document.createElement("div");
    messageElement.className = "message";
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatMessages.appendChild(messageElement);
  }

  // Event listener for sending a message
  sendButton.addEventListener("click", async () => {
    const userMessage = userInput.value;
    addMessage("You", userMessage);
    userInput.value = "";

    // Make an API request to your serverless function
    const response = await fetch("/.netlify/functions/your-serverless-function", {
      method: "POST",
      body: JSON.stringify({ message: userMessage }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const chatGptResponse = data.message; // Assuming your server returns a message field
      addMessage("ChatGPT", chatGptResponse);
    } else {
      addMessage("ChatGPT", "Error: Unable to communicate with the server.");
    }
  });
});
