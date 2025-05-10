import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface QuestionType {
  id: string;
  text: string;
  options: Record<string, string>;
  type?: 'radio' | 'checkbox' | 'textarea';
  required?: boolean;
}

interface QuestionResponse {
  questionId: string;
  answer: string | string[];
}

const Questionnaire: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuestionResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  const mockQuestions: QuestionType[] = [
    {
      id: 'q1',
      text: "Your group project is due tomorrow, and one teammate hasn't done their part. What do you do?",
      options: {
        A: "Do their work yourself to get it done",
        B: "Yell at them to step up",
        C: "Talk to them calmly to find out what's wrong and offer help",
        D: "Tell the teacher and let them handle it"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q2',
      text: "You're budgeting for a party with $100. Food costs $60. How much is left?",
      options: {
        A: "$40",
        B: "$160",
        C: "$60",
        D: "$0"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q3',
      text: "Your friend is confused about a homework topic. How do you help?",
      options: {
        A: "Explain it simply with examples they'd get",
        B: "Hand them your notes and walk away",
        C: "Tell them to figure it out themselves",
        D: "Rush through an explanation without checking if they understand"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q4',
      text: "You're asked to brainstorm a new club activity. What's your move?",
      options: {
        A: "Suggest a wild, totally original idea",
        B: "Tweak an existing activity to make it cooler",
        C: "Pick something safe and boring",
        D: "Copy what another club does"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q5',
      text: "Two assignments are due tomorrow, and you've got 3 hours. What's your plan?",
      options: {
        A: "Focus on the bigger one first, then the other",
        B: "Multitask and switch between them",
        C: "Watch TV and hope for a miracle",
        D: "Ask for more time from the teacher"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q6',
      text: "You're stuck on a puzzle: If 2 cats catch 2 mice in 2 minutes, how many minutes for 4 cats to catch 4 mice?",
      options: {
        A: "2",
        B: "4",
        C: "1",
        D: "8"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q7',
      text: "Your boss wants a report by Friday. It's Wednesday. What's your first step?",
      options: {
        A: "Outline the report and start researching",
        B: "Google everything and hope it fits together",
        C: "Write it last-minute on Thursday night",
        D: "Ask a coworker to do it for you"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q8',
      text: "You're presenting your idea to the class. How do you prep?",
      options: {
        A: "Practice a clear, engaging speech",
        B: "Make a text-heavy slide deck to read off",
        C: "Wing it—you've got this!",
        D: "Focus on cool visuals but skip practicing"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q9',
      text: "Your friend vents about a bad day. What do you do?",
      options: {
        A: "Listen quietly and ask how they feel",
        B: "Jump in with your own story",
        C: "Tell them to cheer up and move on",
        D: "Ignore them and check your phone"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q10',
      text: "You're negotiating a trade in a game. They want your rare card. What's your tactic?",
      options: {
        A: "Ask what they'll give and find a fair deal",
        B: "Convince them your card's worth more than it is",
        C: "Give it up easily to keep them happy",
        D: "Refuse unless they offer something amazing"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q11',
      text: "You're analyzing survey data: 3 out of 5 people liked a movie. What percentage is that?",
      options: {
        A: "60%",
        B: "50%",
        C: "75%",
        D: "33%"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q12',
      text: "Your team's falling behind on a project. What's your move?",
      options: {
        A: "Step up and assign tasks to get back on track",
        B: "Wait for someone else to take charge",
        C: "Work alone to catch up faster",
        D: "Suggest scrapping it and starting over"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q13',
      text: "You're designing a poster. How do you make it stand out?",
      options: {
        A: "Sketch a bold, unique layout",
        B: "Use a template but tweak the colors",
        C: "Copy a design you saw online",
        D: "Keep it plain—less is more"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q14',
      text: "Your computer crashes mid-project. What do you do?",
      options: {
        A: "Restart it and troubleshoot the issue",
        B: "Call a friend who's good with tech",
        C: "Give up and start over later",
        D: "Keep clicking random buttons"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q15',
      text: "You're writing a blog post. How do you start?",
      options: {
        A: "Plan the structure and key points first",
        B: "Just start typing whatever comes to mind",
        C: "Copy a post you like and edit it",
        D: "Write a catchy headline and figure out the rest later"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q16',
      text: "You're pitching a startup idea. How do you convince someone to join?",
      options: {
        A: "Share a clear vision with solid benefits",
        B: "Beg them to help because you're desperate",
        C: "Offer them a big role with no details",
        D: "Say it's their loss if they don't join"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q17',
      text: "You're sorting files and notice a typo in a report. What do you do?",
      options: {
        A: "Fix it before anyone sees",
        B: "Ignore it—it's not your job",
        C: "Tell your boss about it later",
        D: "Leave it; no one will notice"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q18',
      text: "Your club needs more members. How do you spread the word?",
      options: {
        A: "Chat up people at lunch about it",
        B: "Post flyers around school",
        C: "Wait for others to join on their own",
        D: "Ask a popular friend to promote it"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q19',
      text: "You're coding a simple game, but it's buggy. What's next?",
      options: {
        A: "Debug line-by-line to find the error",
        B: "Rewrite the whole thing from scratch",
        C: "Google a solution and copy it",
        D: "Leave it broken and move on"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q20',
      text: "You're planning a study schedule. How do you organize it?",
      options: {
        A: "Break it into daily goals with breaks",
        B: "Cram everything into one night",
        C: "Wing it based on your mood",
        D: "Make a list but don't follow it"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q21',
      text: "A science experiment fails. What's your next step?",
      options: {
        A: "Hypothesize why and try again",
        B: "Guess and tweak something random",
        C: "Copy a classmate's method",
        D: "Give up—it's too hard"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q22',
      text: "Your team disagrees on a project idea. How do you handle it?",
      options: {
        A: "Find a compromise everyone likes",
        B: "Push your idea until they agree",
        C: "Let them fight it out and stay quiet",
        D: "Pick the loudest person's idea"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q23',
      text: "You're late on a task but still want to finish strong. What do you do?",
      options: {
        A: "Push through and get it done well",
        B: "Rush it and turn in something sloppy",
        C: "Skip it—better luck next time",
        D: "Blame the delay on someone else"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q24',
      text: "You're learning a new app. How do you figure it out?",
      options: {
        A: "Explore it hands-on and test features",
        B: "Read the help guide first",
        C: "Watch a tutorial online",
        D: "Avoid it unless forced to use it"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q25',
      text: "You're managing a bake sale. How do you assign roles?",
      options: {
        A: "Match tasks to people's strengths",
        B: "Let everyone pick what they want",
        C: "Do most of it yourself",
        D: "Randomly assign jobs"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q26',
      text: "You're stuck with a slow teammate. What's your approach?",
      options: {
        A: "Help them speed up with tips",
        B: "Complain to the group about them",
        C: "Ignore them and move ahead",
        D: "Take over their work quietly"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q27',
      text: "If a car goes 60 miles in 1 hour, how far in 2 hours?",
      options: {
        A: "120 miles",
        B: "60 miles",
        C: "30 miles",
        D: "180 miles"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q28',
      text: "You're pitching a school event. How do you win over the crowd?",
      options: {
        A: "Tell a story to hook them in",
        B: "List facts and stats dryly",
        C: "Shout to get their attention",
        D: "Hope they like it without trying hard"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q29',
      text: "Your group's idea flops. What's your next move?",
      options: {
        A: "Suggest a new plan based on what went wrong",
        B: "Stick with it and hope it works out",
        C: "Blame the team and do your own thing",
        D: "Give up and let someone else fix it"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q30',
      text: "You're researching a topic online. How do you start?",
      options: {
        A: "Find reliable sources and take notes",
        B: "Click the first link and skim it",
        C: "Copy-paste from Wikipedia",
        D: "Guess instead of looking it up"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q31',
      text: "You're leading a cleanup crew. How do you keep it fun?",
      options: {
        A: "Turn it into a game with rewards",
        B: "Just tell everyone what to do",
        C: "Let them slack off if they want",
        D: "Do it all yourself to finish fast"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q32',
      text: "You're editing a friend's essay. What do you focus on?",
      options: {
        A: "Fix grammar and flow carefully",
        B: "Skim it and say it's fine",
        C: "Rewrite it your way without asking",
        D: "Point out flaws but don't fix them"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q33',
      text: "You're building a website, but the code won't run. What now?",
      options: {
        A: "Test small parts to find the bug",
        B: "Start over from scratch",
        C: "Copy code from a tutorial",
        D: "Ignore it and hope it fixes itself"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q34',
      text: "Your team's short on time for a deadline. What's your call?",
      options: {
        A: "Reassign tasks to finish faster",
        B: "Push everyone to work overtime",
        C: "Submit what's done and call it good",
        D: "Delay it and ask for more time"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q35',
      text: "You're decorating for a party. How do you approach it?",
      options: {
        A: "Plan a theme and sketch it out",
        B: "Throw stuff up and see what sticks",
        C: "Copy last year's setup",
        D: "Let someone else handle it"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q36',
      text: "You're chatting with a shy classmate. How do you connect?",
      options: {
        A: "Ask about their interests and listen",
        B: "Talk about yourself to fill the silence",
        C: "Keep it short and walk away",
        D: "Wait for them to speak first"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q37',
      text: "A new rule messes up your routine. What do you do?",
      options: {
        A: "Adjust your plan to fit it",
        B: "Ignore it and do things your way",
        C: "Complain but follow it anyway",
        D: "Freeze and stress about it"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q38',
      text: "You're analyzing sales: 10 items sold at $5 each. Total?",
      options: {
        A: "$50",
        B: "$15",
        C: "$55",
        D: "$10"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q39',
      text: "You're launching a small business. What's your first step?",
      options: {
        A: "Research the market and plan costs",
        B: "Jump in with a cool product idea",
        C: "Wait for the perfect moment",
        D: "Ask friends to fund it without a plan"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q40',
      text: "Your experiment's results don't match your guess. What now?",
      options: {
        A: "Check your method for errors",
        B: "Fudge the data to fit your guess",
        C: "Start over with a new idea",
        D: "Accept it and move on"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q41',
      text: "You're making a video. How do you plan the content?",
      options: {
        A: "Script it with a fun storyline",
        B: "Record random clips and edit later",
        C: "Copy a viral video's style",
        D: "Wing it with no plan"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q42',
      text: "You're fixing a jammed printer. What's your move?",
      options: {
        A: "Check the manual and test fixes",
        B: "Shake it and hope it works",
        C: "Call tech support right away",
        D: "Leave it for someone else"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q43',
      text: "You're persuading a friend to join a club. What do you say?",
      options: {
        A: "Highlight how fun it'll be for them",
        B: "Beg until they say yes",
        C: "Say it's fine if they don't join",
        D: "Guilt them into it"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q44',
      text: "You're scheduling a group meetup. How do you do it?",
      options: {
        A: "Pick a time that works for most",
        B: "Choose what's best for you only",
        C: "Let everyone argue it out",
        D: "Cancel if it's too hard to plan"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q45',
      text: "A riddle: If all birds fly, and penguins are birds, do penguins fly?",
      options: {
        A: "No, they're an exception",
        B: "Yes, all birds fly",
        C: "Maybe, some do",
        D: "I don't know—skip it"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q46',
      text: "You're networking at an event. How do you mingle?",
      options: {
        A: "Introduce yourself and ask questions",
        B: "Stick to people you know",
        C: "Stand alone and wait for someone to talk",
        D: "Leave early—it's awkward"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q47',
      text: "You're designing an app layout. What's your focus?",
      options: {
        A: "Make it user-friendly and unique",
        B: "Copy a popular app's style",
        C: "Keep it basic but functional",
        D: "Focus on looks over function"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q48',
      text: "You're debugging code with a friend. How do you work?",
      options: {
        A: "Split tasks and test together",
        B: "Do it all yourself for speed",
        C: "Let them handle it alone",
        D: "Guess fixes without testing"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q49',
      text: "You're swamped with homework. How do you push through?",
      options: {
        A: "Tackle it bit by bit with focus",
        B: "Rush through and submit early drafts",
        C: "Take breaks and delay some tasks",
        D: "Skip it and catch up later"
      },
      type: 'radio',
      required: true
    },
    {
      id: 'q50',
      text: "You're presenting data to a group. How do you share it?",
      options: {
        A: "Use charts and explain clearly",
        B: "Read numbers off a sheet",
        C: "Show fancy slides with no context",
        D: "Skip the details—just give the conclusion"
      },
      type: 'radio',
      required: true
    }
  ];

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !user) {
          navigate('/login');
          return;
        }

        const response = await fetch('/api/questionnaire/get-answers', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch progress');
        }

        const data = await response.json();
        setQuestions(mockQuestions);

        // Initialize answers if none exist
        const initialAnswers = mockQuestions.map((q) => ({
          questionId: q.id,
          answer: data.answers[q.id] || (q.type === 'checkbox' ? [] : ''),
        }));

        setAnswers(initialAnswers);
        setCurrentQuestion(data.currentQuestion || 0);
        setCompleted(data.completed || false);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching progress:', error);
        navigate('/dashboard');
      }
    };

    fetchProgress();
  }, [navigate, user]);

  // Save progress to backend
  const saveProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch('/api/questionnaire/save-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentQuestion,
          answers: answers.reduce((acc, curr) => {
            acc[curr.questionId] = curr.answer;
            return acc;
          }, {} as Record<string, any>),
        }),
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Auto-save progress when answers or currentQuestion changes
  useEffect(() => {
    if (!isLoading && !completed) {
      saveProgress();
    }
  }, [currentQuestion, answers, isLoading, completed]);

  const handleRadioAnswer = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionId: questions[currentQuestion].id,
      answer: option,
    };
    setAnswers(newAnswers);
  };

  const handleCheckboxAnswer = (option: string) => {
    const newAnswers = [...answers];
    const currentAnswer = newAnswers[currentQuestion].answer as string[];
    if (currentAnswer.includes(option)) {
      newAnswers[currentQuestion] = {
        questionId: questions[currentQuestion].id,
        answer: currentAnswer.filter(item => item !== option),
      };
    } else {
      newAnswers[currentQuestion] = {
        questionId: questions[currentQuestion].id,
        answer: [...currentAnswer, option],
      };
    }
    setAnswers(newAnswers);
  };

  const handleTextAnswer = (text: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionId: questions[currentQuestion].id,
      answer: text,
    };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAnswers();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitAnswers = async () => {
    if (completed) {
      navigate('/dashboard');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        navigate('/login');
        return;
      }

      const formattedAnswers = questions.map((q, index) => ({
        questionId: q.id,
        answer: answers[index].answer
      }));

      navigate('/report-generating');

      const response = await fetch('/api/questionnaire/submit-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: formattedAnswers,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit answers');
      }

      setCompleted(true);
    } catch (error) {
      console.error('Error submitting answers:', error);
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOptionSelected = (option: string): boolean => {
    const currentAnswer = answers[currentQuestion]?.answer;
    if (questions[currentQuestion]?.type === 'radio') {
      return currentAnswer === option;
    } else if (questions[currentQuestion]?.type === 'checkbox') {
      return (currentAnswer as string[])?.includes(option) || false;
    }
    return false;
  };

  const isAnswerValid = () => {
    const question = questions[currentQuestion];
    if (!question.required) return true;
    const answer = answers[currentQuestion];
    if (!answer) return false;
    if (question.type === 'checkbox') {
      return (answer.answer as string[]).length > 0;
    } else if (question.type === 'textarea') {
      return (answer.answer as string).trim() !== '';
    }
    return answer.answer !== '' && answer.answer !== undefined;
  };

  const getTextAreaValue = (): string => {
    return answers[currentQuestion]?.answer as string || '';
  };

  if (isLoading || !questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen w-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const renderQuestionContent = () => {
    const question = questions[currentQuestion];
    if (question.type === 'textarea') {
      return (
        <div className="mt-6">
          <textarea
            className="w-full min-h-32 p-4 border-2 rounded-xl transition-all duration-300 
                      focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                      bg-white shadow-sm hover:shadow resize-y text-black"
            placeholder="Type your answer here..."
            value={getTextAreaValue()}
            onChange={(e) => handleTextAnswer(e.target.value)}
            rows={6}
          />
        </div>
      );
    }
    return (
      <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {Object.entries(question.options).map(([option, text]) => (
          <label
            key={option}
            className={`group relative flex items-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.01] ${
              isOptionSelected(option)
                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
            }`}
          >
            <div className="relative">
              {question.type === 'radio' ? (
                <>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={isOptionSelected(option)}
                    onChange={() => handleRadioAnswer(option)}
                    className="peer sr-only"
                  />
                  <div className={`h-5 w-5 rounded-full border-2 transition-all duration-300 ${
                    isOptionSelected(option)
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-gray-300 group-hover:border-indigo-300'
                  }`}>
                    <div className={`h-2 w-2 rounded-full bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                      isOptionSelected(option) ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                    }`} />
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="checkbox"
                    name={`question-${question.id}`}
                    value={option}
                    checked={isOptionSelected(option)}
                    onChange={() => handleCheckboxAnswer(option)}
                    className="peer sr-only"
                  />
                  <div className={`h-5 w-5 rounded-md border-2 transition-all duration-300 ${
                    isOptionSelected(option)
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-gray-300 group-hover:border-indigo-300'
                  }`}>
                    <div className={`h-2 w-2 bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                      isOptionSelected(option) ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                    }`} />
                  </div>
                </>
              )}
            </div>
            <span className={`ml-4 text-lg transition-colors duration-300 ${
              isOptionSelected(option)
                ? 'text-indigo-900 font-medium'
                : 'text-gray-700'
            }`}>
              {text}
            </span>
          </label>
        ))}
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-gray-50 p-4">
      <div className="bg-gradient-to-br from-indigo-50 to-white shadow-xl rounded-2xl overflow-hidden transition-all duration-500 transform hover:shadow-2xl w-full max-w-4xl">
        <div className="p-8 sm:p-10">
          <div className="mb-8">
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="font-medium text-indigo-600">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-gray-500">
                {Math.round((currentQuestion + 1) / questions.length * 100)}% Complete
              </span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 leading-tight">
            {questions[currentQuestion].text}
          </h2>
          {renderQuestionContent()}
          {!isAnswerValid() && questions[currentQuestion].required && (
            <div className="mt-4 flex items-center text-yellow-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {questions[currentQuestion].type === 'textarea'
                ? 'Please enter some text to continue'
                : 'Please select an option to continue'}
            </div>
          )}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`relative inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 transform ${
                currentQuestion === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-indigo-600 hover:-translate-x-1 border border-gray-200 shadow-sm hover:shadow'
              }`}
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={(questions[currentQuestion].required && !isAnswerValid()) || isSubmitting}
              className={`relative inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 transform ${
                (questions[currentQuestion].required && !isAnswerValid()) || isSubmitting
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 hover:translate-x-1 shadow-md hover:shadow-lg'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
                  <ChevronRight className="h-5 w-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;