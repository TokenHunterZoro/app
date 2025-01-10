export const metadata = {
  title: "Embedded Content",
};

export default function EmbedPage() {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#000" }}>
      <iframe
        src="https://zorox-ai.vercel.app/token/189229"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          position: "absolute",
          top: 0,
          left: 0,
        }}
        allow="fullscreen; web3"
      ></iframe>
    </div>
  );
}
