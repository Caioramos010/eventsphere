# Guia de Componentes Padronizados - EventSphere

Este documento apresenta os novos componentes padronizados criados para manter consistência visual e modularidade no frontend do EventSphere.

## Componentes Disponíveis

### 1. PageTitle
Componente para títulos de página padronizados com ícone, título, subtítulo e descrição.

**Uso:**
```jsx
import { PageTitle } from '../components';
import { IoCalendarOutline } from 'react-icons/io5';

<PageTitle
  icon={IoCalendarOutline}
  title="Meus Eventos"
  subtitle="Eventos criados por você e onde você participa"
  description="Gerencie todos os seus eventos em um só lugar"
  size="large" // 'small', 'medium', 'large'
  className="custom-class"
/>
```

**Props:**
- `icon`: Componente de ícone do react-icons
- `title`: Título principal (obrigatório)
- `subtitle`: Subtítulo opcional
- `description`: Descrição opcional
- `size`: Tamanho do componente ('small', 'medium', 'large')
- `className`: Classes CSS adicionais

### 2. StandardButton
Botão padronizado com múltiplas variantes, tamanhos e estados.

**Uso:**
```jsx
import { StandardButton } from '../components';
import { IoAddCircleOutline } from 'react-icons/io5';

<StandardButton
  variant="primary" // 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'
  size="medium" // 'small', 'medium', 'large'
  icon={IoAddCircleOutline}
  iconPosition="left" // 'left', 'right'
  loading={isLoading}
  disabled={isDisabled}
  fullWidth={false}
  onClick={handleClick}
>
  Criar Evento
</StandardButton>
```

**Props:**
- `variant`: Estilo do botão ('primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark')
- `size`: Tamanho do botão ('small', 'medium', 'large')
- `icon`: Componente de ícone do react-icons
- `iconPosition`: Posição do ícone ('left', 'right')
- `loading`: Estado de carregamento (mostra spinner)
- `disabled`: Estado desabilitado
- `fullWidth`: Ocupar toda a largura disponível
- `onClick`: Função de clique
- `type`: Tipo do botão ('button', 'submit', 'reset')
- `className`: Classes CSS adicionais

### 3. StandardCard
Card padronizado com diferentes variantes e efeitos.

**Uso:**
```jsx
import { StandardCard } from '../components';

<StandardCard
  variant="glass" // 'default', 'glass', 'solid', 'gradient'
  padding="medium" // 'small', 'medium', 'large'
  hover={true}
  onClick={handleClick} // Torna o card clicável
>
  <h3>Conteúdo do Card</h3>
  <p>Descrição do conteúdo...</p>
</StandardCard>
```

**Props:**
- `variant`: Estilo do card ('default', 'glass', 'solid', 'gradient')
- `padding`: Espaçamento interno ('small', 'medium', 'large')
- `hover`: Ativar efeito hover
- `onClick`: Função de clique (torna o card clicável)
- `className`: Classes CSS adicionais

## Padronização de Cores

Os componentes seguem a paleta de cores do EventSphere:

- **Primary**: Gradiente roxo/rosa (#E82E9B → #4a9eff)
- **Secondary**: Transparente com borda branca
- **Success**: Verde (#27ae60 → #2ecc71)
- **Danger**: Vermelho (#e74c3c → #c0392b)
- **Warning**: Laranja (#f39c12 → #e67e22)
- **Info**: Azul (#3498db → #2980b9)
- **Light**: Branco com texto escuro
- **Dark**: Cinza escuro (#2c3e50 → #34495e)

## Exemplos de Uso Completo

### Página com PageTitle e botões
```jsx
import React from 'react';
import { Header, Footer, PageTitle, StandardButton, StandardCard } from '../components';
import { IoCalendarOutline, IoAddCircleOutline } from 'react-icons/io5';

const MyPage = () => {
  return (
    <>
      <Header />
      <div className="page-container">
        <div className="page-main">
          <div className="page-header">
            <PageTitle
              icon={IoCalendarOutline}
              title="Meus Eventos"
              subtitle="Gerencie seus eventos"
              description="Crie, edite e visualize todos os seus eventos em um só lugar"
            />
            
            <StandardButton
              variant="primary"
              size="large"
              icon={IoAddCircleOutline}
              onClick={() => navigate('/create-event')}
            >
              Criar Evento
            </StandardButton>
          </div>

          <StandardCard variant="glass" padding="large">
            <h3>Conteúdo Principal</h3>
            <p>Aqui vai o conteúdo da página...</p>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <StandardButton variant="success" size="medium">
                Salvar
              </StandardButton>
              <StandardButton variant="secondary" size="medium">
                Cancelar
              </StandardButton>
            </div>
          </StandardCard>
        </div>
      </div>
      <Footer />
    </>
  );
};
```

### Card clicável com hover
```jsx
<StandardCard
  variant="glass"
  padding="medium"
  hover={true}
  onClick={() => navigate(`/event/${event.id}`)}
  className="event-card-clickable"
>
  <h3>{event.name}</h3>
  <p>{event.description}</p>
  <div className="event-meta">
    <span>{event.date}</span>
    <span>{event.location}</span>
  </div>
</StandardCard>
```

### Formulário com botões padronizados
```jsx
<form onSubmit={handleSubmit}>
  <StandardCard variant="default" padding="large">
    <h2>Criar Novo Evento</h2>
    
    {/* Campos do formulário... */}
    
    <div className="form-actions">
      <StandardButton
        type="submit"
        variant="primary"
        size="large"
        loading={isSubmitting}
        disabled={!isValid}
        fullWidth
      >
        {isSubmitting ? 'Criando...' : 'Criar Evento'}
      </StandardButton>
      
      <StandardButton
        type="button"
        variant="secondary"
        size="large"
        onClick={() => navigate('/events')}
        fullWidth
      >
        Cancelar
      </StandardButton>
    </div>
  </StandardCard>
</form>
```

## Responsividade

Todos os componentes são responsivos e se adaptam automaticamente a diferentes tamanhos de tela:

- **Desktop**: Tamanhos completos e efeitos hover
- **Tablet**: Tamanhos reduzidos ligeiramente
- **Mobile**: Tamanhos otimizados e efeitos touch-friendly

## Customização

Cada componente aceita a prop `className` para customizações específicas:

```jsx
<StandardButton
  variant="primary"
  className="my-custom-button"
>
  Botão Customizado
</StandardButton>
```

```css
.my-custom-button {
  /* Suas customizações aqui */
  margin-top: 2rem;
  box-shadow: 0 4px 20px rgba(232, 46, 155, 0.5);
}
```

## Migração de Componentes Antigos

### Substituir botões antigos:
```jsx
// Antes
<button className="modern-btn modern-btn-primary">
  <IoAddCircleOutline />
  <span>Criar Evento</span>
</button>

// Depois
<StandardButton variant="primary" icon={IoAddCircleOutline}>
  Criar Evento
</StandardButton>
```

### Substituir cards antigos:
```jsx
// Antes
<div className="glass-card">
  <div className="card-content">
    Conteúdo...
  </div>
</div>

// Depois
<StandardCard variant="glass" padding="medium">
  Conteúdo...
</StandardCard>
```

### Substituir títulos de página:
```jsx
// Antes
<div className="page-title">
  <IoCalendarOutline className="page-icon" />
  <div>
    <h1>Meus Eventos</h1>
    <div className="subtitle">Gerencie seus eventos</div>
  </div>
</div>

// Depois
<PageTitle
  icon={IoCalendarOutline}
  title="Meus Eventos"
  subtitle="Gerencie seus eventos"
/>
```

## Exportação

Todos os componentes são exportados através do arquivo `components/index.js`:

```jsx
import { 
  PageTitle, 
  StandardButton, 
  StandardCard,
  Header,
  Footer,
  // ... outros componentes
} from '../components';
```

Isso facilita a importação e mantém o código mais limpo e organizado.
