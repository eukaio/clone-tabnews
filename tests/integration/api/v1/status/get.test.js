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

  //expect(responseBody.dependencies.webserver.version).toEqual(18.18);

  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
  expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

  expect(responseBody.dependencies.database.max_connections).toBeGreaterThan(
    responseBody.dependencies.database.opened_connections,
  );
  //expect(responseBody.dependencies.database.version).toEqual(16);
});
