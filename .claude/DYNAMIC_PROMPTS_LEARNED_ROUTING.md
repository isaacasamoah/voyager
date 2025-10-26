# Voyager Platform - Dynamic Routing & Mode System

## Overview
Conversational co-learning platform with three specialized modes and intelligent routing.

## Core Modes

### 1. Coach Mode
- **Purpose**: Direct assistance and answers
- **Triggers**: Factual questions, "how do I", debugging, time pressure
- **Behavior**: Standard helpful LLM response

### 2. Curator Mode  
- **Purpose**: Elevate human thinking, avoid dependence
- **Philosophy**: Partner in pursuing excellence, not a crutch
- **Behavior**: Reflection before answers, questions that sharpen, scaffolding that fades
- **Challenge**: Maintaining domain expertise richness while curator stance
- **Output**: Ephemeral working chat → final polished community post

### 3. Expert Interview Mode
- **Purpose**: Extract tacit knowledge from world-class practitioners  
- **Target**: Genuine experts with deep experiential insight
- **Goals**: 
  - Detect/verify expertise (specificity, edge cases, "it depends", failure literacy)
  - Extract tacit knowledge (decision frameworks, mental models, heuristics)
  - Structure capture for RAG
- **Techniques**: Critical incident, "walk me through last time", anti-patterns

## Routing Architecture

### Phase 1: Rule-Based Router (Current Implementation)
- User query → Router prompt analyzes and suggests mode
- **Option B approach**: Suggest mode + user confirms/overrides
- Logs every decision for learning

### Router Decision Format
```
Claude suggests: "🎯 EXPERT INTERVIEW mode - I'm detecting deep technical expertise..."
User chooses: [mode]
System logs: query, suggestion, choice, outcome signals
```

### Data Collection Structure
```json
{
  "query": "...",
  "router_suggestion": "...",
  "user_choice": "...",
  "outcome_signals": {
    "conversation_length": 12,
    "thumbs_up": true,
    "followed_up": true
  }
}
```

### Future: Learned Routing
- After sufficient data, upgrade to learned classifier
- But well-tuned rules often outperform black-box models

## Technical Requirements

### Chat History Management
- **Critical**: All modes need full conversation context
- Curator mode: ephemeral chat history → final artifact saved
- Like git commits (working) vs tagged release (artifact)

### Modular Prompt Architecture
```
[DOMAIN EXPERT CONTEXT]
{domain_expertise_block - e.g., career coach knowledge}

[MODE INSTRUCTION]  
{mode_philosophy_block - e.g., curator behavior}

[CONVERSATION HISTORY]
{full_chat_thread}

[CURRENT TASK]
{current_message + mode-specific guidance}
```

**Why modular**: Prevents prompt dilution, keeps domain expertise sharp while mode controls behavior

## Current Challenge
Curator mode losing focus/specificity from underlying domain expert prompt (career coach). Suspected cause: chat history not being passed properly.

## First Use Case
Career coach expert - extracting knowledge about placing candidates in high-paying tech roles (Australia/NZ market).

## Design Philosophy
- Build for understanding, not just speed
- Every component should be explainable
- User remains driver with intimate knowledge
- AI as force multiplier, not mystery box
```

## Implementation Plan

### Phase 1: Polish Curator Mode with Modular Prompts (Current - Week 1)

**Goal**: Complete curator mode with proper domain expertise retention

**Why modular prompts in Phase 1?**
- Curator mode feels "vague" because it loses domain expertise when switching from coach
- Modular prompts are simple to implement (restructure JSON + update prompt builder)
- Essential for curator mode to feel delightful
- Sets foundation for all future modes

**Tasks**:
1. ✅ Understand curator architecture
2. ✅ Refactor message naming
3. ✅ Clean up dead code
4. **🔄 Implement modular prompt architecture**
   - Restructure community JSON: `domainExpertise` + `modes` sections
   - Update prompt builder in API to compose modularly
   - Test that curator retains career coach knowledge
5. 🔄 Test end-to-end flow
6. 🔄 Fix "post without assistance" UX
7. 🔄 Document patterns

**Modular Prompt Structure**:
```
[DOMAIN EXPERTISE] ← Career coach knowledge (always present)
[MODE BEHAVIOR]    ← Coach/Curator instructions (variable)
[HISTORY]          ← Conversation context
[TASK]            ← Current message
```

**Community JSON redesign**:
```json
{
  "domainExpertise": {
    "role": "ANZ Tech Career Expert",
    "knowledge": "Specializes in Australian tech market...",
    "capabilities": [...]
  },
  "modes": {
    "coach": {
      "behavior": "Provide direct, helpful answers",
      "style": "Concise and actionable"
    },
    "curator": {
      "behavior": "Guide user to craft community posts",
      "format": "TITLE:/POST:/[READY_TO_POST]",
      "directive": "2-3 messages maximum"
    }
  }
}
```

---

### Phase 2: Add Simple Router (Week 2)
**Goal**: Mode suggestion with user confirmation

**Implementation**: Option B - AI suggests, user confirms/overrides
**Data**: Log every routing decision for learning

---

### Phase 3: Expert Interview Mode (Week 4-6)
**Goal**: Extract tacit knowledge from experts
**Output**: RAG-ready insights to improve coach/curator

---

### Phase 4: Learned Routing (Week 8+)
**Goal**: Analyze data, refine routing (rules or learned classifier)
  