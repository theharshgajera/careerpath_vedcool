import fs from 'fs';
import path from 'path';

// Define the structure of the scoring system
interface ScoringSystem {
  [questionId: string]: {
    [trait: string]: {
      [answer: string]: number;
    };
  };
}

// Define the structure of answers (questionId -> answer(s))
interface Answers {
  [questionId: string]: string | string[];
}

// Define the structure of trait scores
interface TraitScores {
  [trait: string]: number;
}

class AssessmentManager {
  private traitScores: TraitScores;
  private scoringSystem: ScoringSystem;

  constructor() {
    // Initialize all traits with default score 0.0
    this.traitScores = {
      'Analytical Thinking': 0.0,
      'Critical Thinking': 0.0,
      'Problem-Solving': 0.0,
      'Logical Reasoning': 0.0,
      'Decision-Making': 0.0,
      'Strategic Planning': 0.0,
      'Research Skills': 0.0,
      'Data Analysis': 0.0,
      'Verbal Communication': 0.0,
      'Written Communication': 0.0,
      'Presentation Skills': 0.0,
      'Active Listening': 0.0,
      'Negotiation': 0.0,
      'Persuasion': 0.0,
      'Public Speaking': 0.0,
      'Teamwork': 0.0,
      'Collaboration': 0.0,
      'Empathy': 0.0,
      'Conflict Resolution': 0.0,
      'Networking': 0.0,
      'Relationship Building': 0.0,
      'Technical Aptitude': 0.0,
      'Coding/Programming': 0.0,
      'Mathematical Skills': 0.0,
      'Scientific Knowledge': 0.0,
      'Digital Literacy': 0.0,
      'Creativity': 0.0,
      'Innovation': 0.0,
      'Design Thinking': 0.0,
      'Artistic Skills': 0.0,
      'Content Creation': 0.0,
      'Leadership': 0.0,
      'Time Management': 0.0,
      'Project Management': 0.0,
      'Organizational Skills': 0.0,
      'Entrepreneurial Mindset': 0.0,
      'Adaptability': 0.0,
      'Work Ethic': 0.0,
      'Resilience': 0.0,
      'Attention to Detail': 0.0
    };

    // Load scoring system
    const scoringPath = path.resolve(__dirname, '..', 'config', 'scoring_system.json');
    try {
      if (!fs.existsSync(scoringPath)) {
        throw new Error(`Scoring system file not found at ${scoringPath}. Please ensure the file exists in backend/src/config/.`);
      }

      const rawData = fs.readFileSync(scoringPath, 'utf-8');
      this.scoringSystem = JSON.parse(rawData);
      this.validateScoringSystem();
    } catch (error) {
      console.error('Failed to load scoring system:', error);
      throw new Error(`Failed to initialize AssessmentManager: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateScoringSystem(): void {
    const missingTraits = new Set<string>();

    for (const question of Object.values(this.scoringSystem)) {
      for (const trait of Object.keys(question)) {
        if (!(trait in this.traitScores)) {
          missingTraits.add(trait);
        }
      }
    }

    if (missingTraits.size > 0) {
      throw new Error(`Scoring system contains undefined traits: ${Array.from(missingTraits).join(', ')}`);
    }
  }

  public calculateScores(answers: Answers): TraitScores {
    try {
      // Reset scores
      for (const trait in this.traitScores) {
        this.traitScores[trait] = 0.0;
      }

      // Process each answer
      for (const [questionId, answer] of Object.entries(answers)) {
        if (!(questionId in this.scoringSystem)) {
          continue;
        }

        const questionData = this.scoringSystem[questionId];
        const selectedAnswers = Array.isArray(answer) ? answer : [answer];

        for (const trait in questionData) {
          const traitValues = questionData[trait];
          for (const ans of selectedAnswers) {
            if (ans in traitValues) {
              this.traitScores[trait] += traitValues[ans];
            }
          }
        }
      }

      // Normalize scores
      return this.normalizeScores();
    } catch (error) {
      console.error('Score calculation failed:', error);
      throw error;
    }
  }

  private normalizeScores(): TraitScores {
    const maxPossible: TraitScores = { ...this.traitScores };

    // Calculate maximum possible score for each trait
    for (const question of Object.values(this.scoringSystem)) {
      for (const [trait, options] of Object.entries(question)) {
        if (Object.keys(options).length > 0) {
          const maxInQuestion = Math.max(...Object.values(options));
          maxPossible[trait] += maxInQuestion;
        }
      }
    }

    // Normalize scores to 0-100 range
    const normalized: TraitScores = {};
    for (const [trait, score] of Object.entries(this.traitScores)) {
      if (maxPossible[trait] > 0) {
        normalized[trait] = Math.round((score / maxPossible[trait]) * 100 * 100) / 100; // Round to 2 decimal places
      } else {
        normalized[trait] = 0.0;
      }
    }

    return normalized;
  }
}

export default AssessmentManager;