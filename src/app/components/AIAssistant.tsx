import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedPrompts = [
  '¿Cómo escribo una propuesta para un huerto comunitario?',
  '¿Cuáles son las pautas de presupuesto para proyectos?',
  'Muéstrame propuestas cerca de mi barrio',
  '¿Cómo funciona el proceso de votación?'
];

const mockResponses: { [key: string]: string } = {
  default: "¡Estoy aquí para ayudarte a navegar el proceso de presupuesto participativo! Puedo asistirte con la redacción de propuestas, entender las reglas y pautas, encontrar proyectos cerca de ti y responder preguntas sobre la plataforma.",
  proposal: "¡Excelente! Creemos una propuesta convincente juntos. Primero, dime qué tipo de proyecto estás pensando. ¿Está relacionado con:\n\n• Parques y Recreación\n• Infraestructura\n• Educación\n• Medio Ambiente\n• Servicios Comunitarios\n\nTe ayudaré a estructurarlo correctamente y asegurar que cumpla con todos los requisitos.",
  budget: "Las pautas de presupuesto varían por categoría de proyecto:\n\n• Proyectos Pequeños (<$50K): Mejoras comunitarias, pequeñas renovaciones de parques\n• Proyectos Medianos ($50K-$200K): Renovaciones de áreas de juego, mejoras de calles\n• Proyectos Grandes (>$200K): Infraestructura mayor, construcción de instalaciones\n\nTodas las propuestas deben incluir:\n- Desglose detallado de costos\n- Cronograma de implementación\n- Evaluación de impacto comunitario\n- Plan de mantenimiento",
   voting: "El proceso de votación es simple y transparente:\n\n1. **Fase de Propuestas** (2 semanas): Los ciudadanos envían propuestas\n2. **Fase de Revisión** (1 semana): El personal de la ciudad revisa la viabilidad\n3. **Fase de Votación** (2 semanas): La comunidad vota por las propuestas\n4. **Implementación**: Las propuestas más votadas dentro del presupuesto son aprobadas\n\nCada ciudadano puede votar por múltiples proyectos. Los proyectos más populares que se ajusten al presupuesto asignado son seleccionados para implementación.",
};

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "¡Hola! Soy tu Asistente Cívico IA. Estoy aquí para ayudarte a participar en el proceso de presupuesto participativo. ¿Cómo puedo asistirte hoy?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content?: string) => {
    const messageContent = content || inputValue.trim();
    if (!messageContent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let responseContent = mockResponses.default;

      if (messageContent.toLowerCase().includes('proposal') || messageContent.toLowerCase().includes('write')) {
        responseContent = mockResponses.proposal;
      } else if (messageContent.toLowerCase().includes('budget') || messageContent.toLowerCase().includes('guideline')) {
        responseContent = mockResponses.budget;
      } else if (messageContent.toLowerCase().includes('voting') || messageContent.toLowerCase().includes('vote')) {
        responseContent = mockResponses.voting;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 bg-white rounded-2xl shadow-2xl z-50 flex flex-col transition-all ${
        isMinimized ? 'sm:w-80 h-16' : 'sm:w-96 h-[500px] sm:h-[600px]'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold">Asistente Cívico IA</div>
            {!isMinimized && <div className="text-xs text-purple-100">Siempre aquí para ayudarte</div>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm whitespace-pre-line">{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-purple-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-3">
              <div className="text-xs text-gray-500 mb-2">Preguntas sugeridas:</div>
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Pregúntame lo que quieras..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim()}
                className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
