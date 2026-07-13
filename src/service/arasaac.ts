// src/services/arasaac.ts
export const buscarPictogramas = async (termo: string) => {
  try {
    const response = await fetch(`https://api.arasaac.org/v1/pictograms/pt/search/${termo}`);
    if (!response.ok) {
      throw new Error('Erro ao conectar com a API do ARASAAC');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro no serviço ARASAAC:", error);
    return [];
  }
};