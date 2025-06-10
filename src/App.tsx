import { useState } from "react";

export default function App() {
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState("");
  const [status, setStatus] = useState("");

  const handleSend = async () => {
    if (!file || !stage) {
      setStatus("Fichier et nom du stagiaire requis.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("stage", stage);

    try {
      const response = await fetch("https://mailsenderapi-mmeo.onrender.com/send", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(`✅ ${data.envoyes} emails envoyés pour ${data.stage}`);
      } else {
        setStatus(`❌ Erreur : ${data.error || "Erreur inconnue"}`);
        if (data.available_stages) {
          setStatus(prev => prev + `\nStages valides : ${data.available_stages.join(", ")}`);
        }
      }
    } catch (error) {
      setStatus("❌ Erreur réseau ou serveur injoignable.");
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 500 }}>
      <h2>ISMAC - Envoi de mails automatiques</h2>

      <label>Nom du stagiaire (exactement comme dans le CSV et .env) :</label>
      <input
        type="text"
        value={stage}
        onChange={(e) => setStage(e.target.value)}
        placeholder="Anu ou Chhaju"
        style={{ width: "100%", padding: "0.5em", marginBottom: 10 }}
      />

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ marginBottom: 20 }}
      />

      <button onClick={handleSend} style={{ padding: "0.5em 1em" }}>
        Envoyer
      </button>

      <pre style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>{status}</pre>
    </div>
  );
}
