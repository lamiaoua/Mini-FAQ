// pages/index.js
import ChatComponent from '../components/ChatComponent';

export default function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🤖 Mini FAQ Agent avec Historique</h1>
      
      {/* ✅ ChatComponent gère toute l'interface et la logique */}
      <ChatComponent />
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "20px",
    background: "#1e1e1e",
    fontFamily: "Arial",
  },
  title: { 
    color: "#61dafb",
    textAlign: "center",
    marginBottom: "30px"
  }
};