"use client";

import { useEffect, useCallback, useState } from "react";
import sdk, {
  AddFrame,
  SignIn as SignInCore,
  type Context,
} from "@farcaster/frame-sdk";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";

import { config } from "~/components/providers/WagmiProvider";
import { truncateAddress } from "~/lib/truncateAddress";
import { base, optimism } from "wagmi/chains";
import { useSession } from "next-auth/react";
import { createStore } from "mipd";
import { Label } from "~/components/ui/label";
import { PROJECT_TITLE } from "~/lib/constants";

function QuizCard({ 
  quizState, 
  onStart, 
  onAnswer 
}: { 
  quizState?: QuizState;
  onStart: () => void;
  onAnswer: (answerIndex: number) => void;
}) {
  if (!quizState || quizState.currentQuestion === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Welcome to the Quiz!</CardTitle>
          <CardDescription>
            Test your knowledge with our interactive quiz
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <button
            onClick={onStart}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Start Quiz
          </button>
        </CardContent>
      </Card>
    );
  }

  if (quizState.isComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Complete!</CardTitle>
          <CardDescription>
            You scored {quizState.score} out of {questions.length}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const currentQuestion = questions[quizState.currentQuestion - 1];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Question {quizState.currentQuestion}</CardTitle>
        <CardDescription>{currentQuestion.question}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswer(index)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {option}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

export default function Frame() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [quizState, setQuizState] = useState<QuizState>(initialQuizState);

  const [added, setAdded] = useState(false);

  const [addFrameResult, setAddFrameResult] = useState("");

  const addFrame = useCallback(async () => {
    try {
      await sdk.actions.addFrame();
    } catch (error) {
      if (error instanceof AddFrame.RejectedByUser) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      if (error instanceof AddFrame.InvalidDomainManifest) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      setAddFrameResult(`Error: ${error}`);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      if (!context) {
        return;
      }

      setContext(context);
      setAdded(context.client.added);

      // If frame isn't already added, prompt user to add it
      if (!context.client.added) {
        addFrame();
      }

      sdk.on("frameAdded", ({ notificationDetails }) => {
        setAdded(true);
      });

      sdk.on("frameAddRejected", ({ reason }) => {
        console.log("frameAddRejected", reason);
      });

      sdk.on("frameRemoved", () => {
        console.log("frameRemoved");
        setAdded(false);
      });

      sdk.on("notificationsEnabled", ({ notificationDetails }) => {
        console.log("notificationsEnabled", notificationDetails);
      });
      sdk.on("notificationsDisabled", () => {
        console.log("notificationsDisabled");
      });

      sdk.on("primaryButtonClicked", () => {
        console.log("primaryButtonClicked");
      });

      console.log("Calling ready");
      sdk.actions.ready({});

      // Set up a MIPD Store, and request Providers.
      const store = createStore();

      // Subscribe to the MIPD Store.
      store.subscribe((providerDetails) => {
        console.log("PROVIDER DETAILS", providerDetails);
        // => [EIP6963ProviderDetail, EIP6963ProviderDetail, ...]
      });
    };
    if (sdk && !isSDKLoaded) {
      console.log("Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded, addFrame]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="w-[300px] mx-auto py-2 px-2">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-700 dark:text-gray-300">
          {PROJECT_TITLE}
        </h1>
        <QuizCard 
          quizState={quizState}
          onStart={() => {
            setQuizState(prev => ({
              ...prev,
              currentQuestion: 1
            }));
          }}
          onAnswer={(answerIndex) => {
            const currentQuestion = questions[quizState.currentQuestion - 1];
            const isCorrect = answerIndex === currentQuestion.correctAnswer;
            
            setQuizState(prev => ({
              ...prev,
              score: isCorrect ? prev.score + 1 : prev.score,
              currentQuestion: prev.currentQuestion + 1,
              isComplete: prev.currentQuestion >= questions.length
            }));
          }}
        />
      </div>
    </div>
  );
}
