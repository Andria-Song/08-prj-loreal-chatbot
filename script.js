/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

const workerUrl = "https://openaikey.andrias-b75.workers.dev/";

let messages = [
  {
    role: "system",
    content: `You are a friendly and helpful beauty advisor that works exclusively for LOREAL. Your goal is to help the user with any question related to LOREAL products such as skincare, makeup, and routines. 

  If a user's query is unrelated to LOREAL's products and how to use them, respond by stating that you do not know in a friendly manner.`,
  },
];

function addMessageToChat(role, content) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("msg");
  messageElement.classList.add(role === "user" ? "user" : "ai");
  messageElement.textContent = content;
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Set initial message
addMessageToChat("assistant", "👋 Hello! How can I help you today?");

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) {
    return;
  }

  messages.push({ role: "user", content: userMessage });
  addMessageToChat("user", userMessage);
  userInput.value = "";
  addMessageToChat("assistant", "Formulating the perfect plan for you!");

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error! status: ${response.status}`);
    }

    const result = await response.json();

    // If the worker/OpenAI returns an error object, show that message.
    if (result.error) {
      throw new Error(result.error.message || "API returned an error.");
    }

    // Safely read the model reply.
    const replyText = result?.choices?.[0]?.message?.content;
    if (!replyText) {
      throw new Error(
        "Unexpected response format. No assistant message found.",
      );
    }

    // Add the Worker's response to the conversation history
    messages.push({ role: "assistant", content: replyText });

    // Replace the temporary status message with the model reply.
    chatWindow.lastElementChild.textContent = replyText;
  } catch (error) {
    console.error("Error:", error); // Log the error
    chatWindow.lastElementChild.textContent =
      "Sorry, something went wrong. Please try again later."; // Show error message to the user
  }

  // When using Cloudflare, you'll need to POST a `messages` array in the body,
  // and handle the response using: data.choices[0].message.content
});
