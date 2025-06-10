import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

interface ApiResponse {
  envoyes: number;
  stage: string;
  error?: string;
  available_stages?: string[];
  unmatched?: { prenom: string; nom: string; email: string; comment: string; program: string }[];
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [unmatched, setUnmatched] = useState<ApiResponse["unmatched"]>([]);

  const handleSend = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setUnmatched([]);
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

      const data: ApiResponse = await response.json();

      if (response.ok) {
        setStatus(`✅ ${data.envoyes} emails envoyés pour ${data.stage}`);
        setUnmatched(data.unmatched || []);
      } else {
        setStatus(`❌ Erreur : ${data.error || "Erreur inconnue"}`);
        setUnmatched(data.unmatched || []);
        if (data.available_stages) {
          setStatus(prev => prev + `\nStages valides : ${data.available_stages?.join(", ")}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur réseau ou serveur injoignable";
      setStatus(`❌ ${errorMessage}`);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleStageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStage(e.target.value);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 500 }}>
      <h2>ISMAC - Envoi de mails automatiques</h2>

      <label>Nom du stagiaire (exactement comme dans le CSV et .env) :</label>
      <input
        type="text"
        value={stage}
        onChange={handleStageChange}
        placeholder="Anu ou Chhaju"
        style={{ width: "100%", padding: "0.5em", marginBottom: 10 }}
      />

      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        style={{ marginBottom: 20 }}
      />

      <button onClick={handleSend} style={{ padding: "0.5em 1em" }}>
        Envoyer
      </button>

      <pre style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>{status}</pre>

      {unmatched && unmatched.length > 0 && (
        <div style={{ marginTop: 20, background: "#e3f2fd", color: "#0d47a1", padding: 14, borderRadius: 6, border: "1px solid #90caf9" }}>
          <strong>Étudiants sans correspondance de template&nbsp;:</strong>
          <ul style={{ paddingLeft: 18 }}>
            {unmatched.map((student, idx) => (
              <li key={idx} style={{ marginBottom: 10, background: '#fff', borderRadius: 4, padding: 8, boxShadow: '0 1px 2px #90caf9' }}>
                <div><b>Nom:</b> {student.prenom} {student.nom}</div>
                <div><b>Email:</b> {student.email}</div>
                <div><b>Programme:</b> {student.program}</div>
                <div><b>Commentaire:</b> {student.comment}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
