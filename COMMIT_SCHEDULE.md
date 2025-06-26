# EventSphere - Cronograma de Commits
**Período: 26 de Junho de 2025 (Quinta-feira) até 30 de Junho de 2025 (Segunda-feira)**

## Divisão da Equipe & Responsabilidades

### 👤 **Pessoa 1 - CRUD de Usuários**
**Responsabilidade Principal:** Sistema completo de gerenciamento de usuários
**Arquivos Backend:**
- `UserService.java` - Lógica de negócio de usuários
- `UserController.java` - Endpoints REST para usuários
- `UserMapper.java` - Conversão entre Entity e DTO
- `UserDisplayDTO.java` - DTO para exibição de usuários
- `UserProfileDTO.java` - DTO para perfil do usuário
- `User.java` - Entidade principal de usuário
- `UserRepository.java` - Repositório JPA para usuários

**Arquivos Frontend:**
- `UserProfile.js` - Página de perfil do usuário
- `AuthService.js` - Serviço de autenticação
- `Login.js` - Página de login
- `Register.js` - Página de registro
- `UserContext.js` - Contexto React para usuários

### 🎉 **Pessoa 2 - CRUD de Eventos** 
**Responsabilidade Principal:** Sistema completo de gerenciamento de eventos
**Arquivos Backend:**
- `EventService.java` - Lógica de negócio de eventos
- `EventController.java` - Endpoints REST para eventos
- `EventMapper.java` - Conversão entre Entity e DTO
- `Event.java` - Entidade principal de evento
- `EventRepository.java` - Repositório JPA para eventos
- `EventStatus.java` - Enum para status do evento
- `EventDTO.java` - DTO para transferência de dados

**Arquivos Frontend:**
- `CreateEvent.js` - Página de criação de eventos
- `EditEvent.js` - Página de edição de eventos
- `EventDetails.js` - Página de detalhes do evento
- `AllEvents.js` - Página listagem de eventos
- `EventService.js` - Serviço para API de eventos
- `EventCard.jsx` - Componente card de evento
- `Calendar.jsx` - Componente calendário

### 👥 **Pessoa 3 - CRUD de Participantes**
**Responsabilidade Principal:** Sistema completo de gerenciamento de participantes
**Arquivos Backend:**
- `ParticipantService.java` - Lógica de negócio de participantes
- `ParticipantController.java` - Endpoints REST para participantes
- `ParticipantMapper.java` - Conversão entre Entity e DTO
- `ParticipantDTO.java` - DTO para transferência de dados
- `ParticipantHistoryMapper.java` - Mapper para histórico
- `Participant.java` - Entidade principal de participante
- `ParticipantRepository.java` - Repositório JPA
- `ParticipantStatus.java` - Enum para status
- `QrCodeService.java` - Serviço de QR Code
- `QrCodeController.java` - Controller para QR Code

**Arquivos Frontend:**
- `QRScanner.js` - Página de escaneamento QR
- `ParticipantService.js` - Serviço para API de participantes
- `EventInvite.js` - Página de convite para evento
- `JoinEvent.js` - Página para entrar no evento
- `MyQRCode.jsx` - Componente de QR Code pessoal

---

## 📅 Cronograma Diário de Commits

### **Quinta-feira, 26 de Junho de 2025**

#### **Pessoa 1 - CRUD de Usuários** (Manhã - 9:00)
```
Commit: "feat: refatorar UserService para usar mappers e remover logs de debug"
- Limpar UserService.java (remover System.out.println, usar logger)
- Implementar UserMapper para conversões DTO
- Remover todos os comentários de UserService.java
- Incluir User.java e UserRepository.java na limpeza
```

#### **Pessoa 2 - CRUD de Eventos** (Tarde - 14:00)
```
Commit: "feat: refatorar EventService e remover métodos não utilizados"
- Limpar EventService.java (remover prints de debug)
- Implementar EventMapper para conversões DTO
- Remover todos os comentários de EventService.java
- Incluir EventRepository.java e EventStatus.java
```

#### **Pessoa 3 - CRUD de Participantes** (Noite - 18:00)
```
Commit: "feat: refatorar ParticipantService e limpar logs de debug"
- Limpar ParticipantService.java (remover console logs)
- Implementar ParticipantMapper para conversões DTO
- Remover todos os comentários de ParticipantService.java
- Incluir Participant.java e ParticipantRepository.java
```

---

### **Sexta-feira, 27 de Junho de 2025**

#### **Pessoa 1 - CRUD de Usuários** (Manhã - 10:00)
```
Commit: "feat: limpar UserController e melhorar tratamento de erros"
- Refatorar UserController.java para usar mappers
- Implementar respostas de erro específicas com mensagens
- Remover todos os comentários de UserController.java
- Finalizar UserDisplayDTO.java e UserProfileDTO.java
```

#### **Pessoa 2 - CRUD de Eventos** (Tarde - 13:00)
```
Commit: "feat: refatorar EventController e implementar mapeamento centralizado"
- Limpar EventController.java (remover declarações de debug)
- Usar EventMapper para todas as conversões DTO
- Remover todos os comentários de EventController.java
- Finalizar EventDTO.java
```

#### **Pessoa 3 - CRUD de Participantes** (Noite - 19:00)
```
Commit: "feat: limpar ParticipantController e remover código não utilizado"
- Refatorar ParticipantController.java para usar mappers
- Remover métodos e variáveis não utilizados
- Remover todos os comentários de ParticipantController.java
- Incluir QrCodeService.java e QrCodeController.java
```

---

### **Sábado, 28 de Junho de 2025**

#### **Pessoa 1 - CRUD de Usuários** (Manhã - 11:00)
```
Commit: "feat: limpar autenticação frontend e componentes de perfil"
- Remover console.log de AuthService.js
- Limpar UserProfile.js (remover declarações de debug e comentários)
- Remover todos os comentários JSX de Login.js e Register.js
- Incluir UserContext.js na limpeza
```

#### **Pessoa 2 - CRUD de Eventos** (Tarde - 15:00)
```
Commit: "feat: limpar componentes frontend de gerenciamento de eventos"
- Remover console.log de EventService.js
- Limpar CreateEvent.js e EditEvent.js (remover logs de debug)
- Remover todos os comentários JSX de EventCard.jsx
- Incluir Calendar.jsx na limpeza
```

#### **Pessoa 3 - CRUD de Participantes** (Noite - 17:00)
```
Commit: "feat: limpar QRScanner e componentes frontend de participantes"
- Remover console.log restantes de QRScanner.js
- Limpar ParticipantService.js (remover declarações de debug)
- Remover todos os comentários de EventInvite.js e JoinEvent.js
- Incluir MyQRCode.jsx na limpeza
```

---

### **Domingo, 29 de Junho de 2025**

#### **Pessoa 1 - CRUD de Usuários** (Manhã - 9:30)
```
Commit: "feat: finalizar DTOs de usuário e implementações de mapper"
- Completar UserDisplayDTO.java e UserProfileDTO.java
- Finalizar UserMapper.java com todos os métodos de conversão
- Garantir que todo tratamento de erro relacionado a usuários esteja centralizado
- Validar User.java e UserRepository.java
```

#### **Pessoa 2 - CRUD de Eventos** (Tarde - 14:30)
```
Commit: "feat: completar integração frontend de eventos e tratamento de erros"
- Finalizar limpeza de EventDetails.js e AllEvents.js
- Garantir exibição adequada de mensagens de erro em componentes de evento
- Remover qualquer código de debug restante de arquivos relacionados a eventos
- Validar EventStatus.java e EventRepository.java
```

#### **Pessoa 3 - CRUD de Participantes** (Noite - 18:30)
```
Commit: "feat: completar DTOs de participantes e funcionalidade de QR code"
- Finalizar ParticipantDTO.java e ParticipantHistoryMapper.java
- Completar limpeza e otimização de QRScanner.js
- Garantir que todo tratamento de erro relacionado a participantes funcione adequadamente
- Validar ParticipantStatus.java e ParticipantRepository.java
```

---

### **Segunda-feira, 30 de Junho de 2025 - DIA FINAL**

#### **Pessoa 1 - CRUD de Usuários** (Manhã - 8:00)
```
Commit: "final: completar integração e testes do sistema CRUD de usuários"
- Validação final do fluxo de autenticação de usuários
- Garantir que toda integração frontend/backend relacionada a usuários funcione
- Limpeza e otimização final de componentes de usuário
- Teste completo do CRUD de usuários
```

#### **Pessoa 2 - CRUD de Eventos** (Tarde - 12:00)
```
Commit: "final: completar sistema CRUD de eventos e otimização de UI"
- Validação final de criação, edição e visualização de eventos
- Garantir que toda integração frontend/backend relacionada a eventos funcione
- Limpeza final e melhorias de UI para componentes de evento
- Teste completo do CRUD de eventos
```

#### **Pessoa 3 - CRUD de Participantes** (Noite - 16:00)
```
Commit: "final: completar CRUD de participantes e sistema de escaneamento QR"
- Validação final de gerenciamento de participantes e escaneamento QR
- Garantir que toda integração frontend/backend relacionada a participantes funcione
- Limpeza e otimização final da funcionalidade do scanner QR
- Teste completo do CRUD de participantes
```

#### **TODA A EQUIPE** (Final - 20:00)
```
Commit: "release: EventSphere v1.0 - Sistema limpo e otimizado"
- Integração final do projeto
- Atualizar documentação
- Preparar para entrega
```

---

## 📋 Diretrizes de Commit

### Formato de Mensagem de Commit:
```
<tipo>: <descrição>

Tipos:
- feat: Nova funcionalidade ou funcionalidade principal
- fix: Correções de bugs
- refactor: Refatoração de código sem mudanças de funcionalidade
- clean: Remoção de comentários, logs de debug, código não utilizado
- final: Integração e otimização final
- release: Versão final para entrega
```

### Lista de Verificação Diária para Cada Pessoa:
- [ ] Remover todos os logs de debug (console.log, System.out.println)
- [ ] Remover todos os comentários (JSDoc, inline, JSX, comentários CSS)
- [ ] Implementar/usar mappers para conversões DTO
- [ ] Garantir tratamento de erro adequado com mensagens específicas
- [ ] Remover variáveis, imports e métodos não utilizados
- [ ] Testar a funcionalidade após limpeza
- [ ] Fazer commit com formato de mensagem adequado

### Notas Importantes:
1. **Cada pessoa deve fazer commit pelo menos uma vez por dia**
2. **Cada pessoa é responsável por um sistema CRUD completo**
3. **Nenhum log de debug ou comentário deve permanecer no código final**
4. **Todas as mensagens de erro devem ser amigáveis e específicas**
5. **Testar funcionalidade após cada limpeza importante**
6. **Coordenar com a equipe para evitar conflitos de merge**

---

## 🚀 Lista de Verificação de Entrega Final

### Conclusão Backend:
- [ ] Todos os serviços usam mappers para conversão DTO
- [ ] Nenhuma chamada System.out.println ou printStackTrace
- [ ] Uso adequado de logger quando necessário
- [ ] Tratamento de erro centralizado com mensagens específicas
- [ ] Nenhum comentário em arquivos Java

### Conclusão Frontend:
- [ ] Nenhuma declaração console.log em arquivos JS/JSX
- [ ] Nenhum comentário JSX ou CSS
- [ ] Exibição adequada de mensagens de erro para usuários
- [ ] Nenhuma variável ou import não utilizado
- [ ] Estrutura de componente limpa e otimizada

### Integração:
- [ ] Todas as operações CRUD funcionando adequadamente
- [ ] Frontend trata adequadamente mensagens de erro do backend
- [ ] Funcionalidade de escaneamento QR funcionando
- [ ] Autenticação e autorização de usuário funcionando
- [ ] Gerenciamento de eventos totalmente funcional
- [ ] Gerenciamento de participantes e rastreamento de presença funcionando

## 📚 Classes e Arquivos Completos por Pessoa

### **Pessoa 1 - Sistema de Usuários (7 arquivos backend + 5 frontend)**
**Backend (7 arquivos):**
1. `src/main/java/com/eventsphere/entity/User.java`
2. `src/main/java/com/eventsphere/repository/UserRepository.java`
3. `src/main/java/com/eventsphere/service/UserService.java`
4. `src/main/java/com/eventsphere/controller/UserController.java`
5. `src/main/java/com/eventsphere/mapper/UserMapper.java`
6. `src/main/java/com/eventsphere/dto/UserDisplayDTO.java`
7. `src/main/java/com/eventsphere/dto/UserProfileDTO.java`

**Frontend (5 arquivos):**
1. `src/pages/Login.js`
2. `src/pages/Register.js`
3. `src/pages/UserProfile.js`
4. `src/services/AuthService.js`
5. `src/contexts/UserContext.js`

### **Pessoa 2 - Sistema de Eventos (7 arquivos backend + 7 frontend)**
**Backend (7 arquivos):**
1. `src/main/java/com/eventsphere/entity/event/Event.java`
2. `src/main/java/com/eventsphere/entity/event/EventStatus.java`
3. `src/main/java/com/eventsphere/repository/EventRepository.java`
4. `src/main/java/com/eventsphere/service/EventService.java`
5. `src/main/java/com/eventsphere/controller/EventController.java`
6. `src/main/java/com/eventsphere/mapper/EventMapper.java`
7. `src/main/java/com/eventsphere/dto/EventDTO.java`

**Frontend (7 arquivos):**
1. `src/pages/CreateEvent.js`
2. `src/pages/EditEvent.js`
3. `src/pages/EventDetails.js`
4. `src/pages/AllEvents.js`
5. `src/services/EventService.js`
6. `src/components/EventCard.jsx`
7. `src/components/Calendar.jsx`

### **Pessoa 3 - Sistema de Participantes (10 arquivos backend + 5 frontend)**
**Backend (10 arquivos):**
1. `src/main/java/com/eventsphere/entity/event/Participant.java`
2. `src/main/java/com/eventsphere/entity/event/ParticipantStatus.java`
3. `src/main/java/com/eventsphere/repository/ParticipantRepository.java`
4. `src/main/java/com/eventsphere/service/ParticipantService.java`
5. `src/main/java/com/eventsphere/controller/ParticipantController.java`
6. `src/main/java/com/eventsphere/mapper/ParticipantMapper.java`
7. `src/main/java/com/eventsphere/mapper/ParticipantHistoryMapper.java`
8. `src/main/java/com/eventsphere/dto/ParticipantDTO.java`
9. `src/main/java/com/eventsphere/service/QrCodeService.java`
10. `src/main/java/com/eventsphere/controller/QrCodeController.java`

**Frontend (5 arquivos):**
1. `src/pages/QRScanner.js`
2. `src/pages/EventInvite.js`
3. `src/pages/JoinEvent.js`
4. `src/services/ParticipantService.js`
5. `src/components/MyQRCode.jsx`

**Prazo Final: Segunda-feira, 30 de Junho de 2025 às 20:00**
