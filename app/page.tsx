return (
  <div className="w-full h-full flex flex-col">

    {/* HEADER */}
    <div className="chat-header">
      <div className="chat-title-block">
        <div>
          <div className="chat-title">Chat with {AI_NAME}</div>
          <div className="chat-subtitle">
            Personalized financial product advisor — comparison & smart recommendations
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={clearChat} className="text-sm text-red-500 hover:underline">Clear</button>
        <div className="text-sm text-gray-500">Powered by {OWNER_NAME}</div>
      </div>
    </div>

    {/* MESSAGES */}
    <div className="messages-area">
      <MessageWall
        messages={messages}
        status={status}
        durations={durations}
        onDurationChange={handleDurationChange}
      />
    </div>

    {/* INPUT BAR */}
    <div className="input-bar-wrapper">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="input-container">
          <input
            {...form.register("message")}
            placeholder="Ask about comparisons, returns, risk profiles..."
            className="input-field"
            disabled={status === "streaming"}
          />
          <button type="submit" className="send-btn">
            <ArrowUp size={18} />
          </button>
        </div>
      </form>

      <div className="chat-footer">
        © {new Date().getFullYear()} {OWNER_NAME} • Terms • Ringel.AI
      </div>
    </div>

  </div>
);
