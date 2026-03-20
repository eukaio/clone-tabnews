import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";
  let database = {};

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
    database = data.dependencies.database;
  }

  return (
    <div>
      ⏰ Última atualização: {updatedAtText}
      <br />
      <br />
      🎲 Versão do banco de dados: {database.version || "Carregando..."}
      <br />
      🚨 Conexões máximas: {database.max_connections || "Carregando..."}
      <br />
      🟢 Conexões ativas: {database.opened_connections || "Carregando..."}
    </div>
  );
}
