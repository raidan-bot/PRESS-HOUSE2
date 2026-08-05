import axios from 'axios';
import { SettingsRepository } from '../../repositories/settings.repository';
import { config } from '../../config/env';

export class AIService {
  static async callAI(prompt: string, systemInstruction: string): Promise<string> {
    const dbSettings = await SettingsRepository.getAISettings();

    if (dbSettings && (dbSettings.aiEnabled === 0 || dbSettings.aiEnabled === false)) {
      return "AI is disabled by the administrator.";
    }

    const finalSystemInstruction = dbSettings?.aiSystemInstruction 
      ? `${dbSettings.aiSystemInstruction}\n\nAdditional Context:\n${systemInstruction}`
      : systemInstruction;

    // Pure Built-in AI Engine (OpenAI / NVIDIA / Local Compatible API)
    const token = dbSettings?.aiApiKey || config.ai.apiKey || '';
    const baseUrl = dbSettings?.aiBaseUrl || config.ai.baseUrl || 'https://integrate.api.nvidia.com/v1';
    const url = `${baseUrl}/chat/completions`.replace(/([^:])\/\//g, '$1/');
    
    const modelsToTry = dbSettings?.aiModel ? [dbSettings.aiModel] : [
      config.ai.primaryModel,
      'nvidia/qwen-2.5-coder-32b-instruct',
      'gpt-4o-mini',
      'gpt-3.5-turbo'
    ];

    for (const model of modelsToTry) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        if (token && !token.includes('your-api-key')) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await axios.post(url, {
          model,
          messages: [
            { role: 'system', content: finalSystemInstruction },
            { role: 'user', content: prompt }
          ],
          temperature: dbSettings?.aiTemperature || 0.3,
          max_tokens: dbSettings?.aiMaxTokens || 1524
        }, {
          headers,
          timeout: 20000
        });
        return response.data?.choices?.[0]?.message?.content || "No response content";
      } catch (err: any) {
        console.error(`Built-in AI Engine error with model ${model}:`, err.response?.data || err.message);
        if (modelsToTry.indexOf(model) === modelsToTry.length - 1) {
          return "AI Assistant is offline. Please configure your AI API key and endpoint in settings.";
        }
      }
    }
    return "AI service temporarily unavailable.";
  }
}
