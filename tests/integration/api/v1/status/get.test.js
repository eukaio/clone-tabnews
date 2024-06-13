import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});
test("GET to /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  const chaves = Object.keys(responseBody.dependencies.database);
  chaves.forEach((chave) => {
    try {
      expect(responseBody.dependencies.database[chave]).toEqual(
        expect.any(String),
      );
    } catch (error) {
      expect(responseBody.dependencies.database[chave]).toEqual(
        expect.any(Number),
      );
    } finally {
      expect(responseBody.dependencies.database[chave]).toBeDefined();
    }
  });

  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
  expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

  expect(responseBody.dependencies.database.version).toEqual(16);
  expect(responseBody.dependencies.database.max_connections).toEqual(100);
  expect(responseBody.dependencies.database.opened_connections).toEqual(1);
});
