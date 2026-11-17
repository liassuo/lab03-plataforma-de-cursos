import Constants from 'expo-constants';

// O Expo informa o endereço do computador que está rodando o "npx expo start"
// (ex: "192.168.0.10:8081"). O backend roda nesse mesmo computador, na porta 3000.
// Assim o app funciona no celular com o Expo Go sem precisar trocar o IP na mão.
const ipDoComputador = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';

export const SERVIDOR = `http://${ipDoComputador}:3000`;
