export async function getMcpPromptTool({
  userInput,
  schema,
}: {
  userInput: string;
  schema: string;
}): Promise<{ text: string }> {
  // 자연어 입력과 스키마 정보를 결합해 프롬프트 생성
  const prompt = `DB 스키마:\n${schema}\n\n사용자 요청:\n${userInput}\n\n위 정보를 바탕으로 적절한 SQL 쿼리를 생성하세요.`;
  return { text: prompt };
}
