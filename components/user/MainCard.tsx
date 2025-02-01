"use client"
import React, { useState } from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { AnimatePresence, motion } from "motion/react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Check, CircleAlert, Cross, InfoIcon, LetterText, MailCheckIcon, RotateCcw, Speech, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
interface UMDecisionInterface {
    action: string,
    reason: string,
    letter: string,
    exception: number | null
}
interface QuestionInterface {
    id: number,
    question: string,
    tooltip: string,
    breadcrumb: string,
    yesIndex: number | null,
    noIndex: number | null,
    choices: {
        yes: string,
        no: string,
    },
    yesUMDecision: UMDecisionInterface | null,
    noUMDecision: UMDecisionInterface | null,
    startTransfer: boolean
}
const defaultQuestion = {
    yesUMDecision: null, noUMDecision: null, startTransfer: false
}
// Additional Cues to Note: Verbal >> YES, Stable >> YES, SFT Clock >> Yes
const ccnQuestions: QuestionInterface[] = [
    {
        id: 0,
        question: "Verbal or Fax?",
        tooltip: "How did NKF notify of new admission?",
        breadcrumb: "Verbal?",
        yesIndex: 1,
        noIndex: 2,
        choices: {
            yes: "Verbal",
            no: "Fax",
        },
        ...defaultQuestion
    },
    {
        id: 1,
        question: "Per NKF Statement, Stable or Not?",
        tooltip: "Did NKF Claim Patient Stable",
        breadcrumb: "NKF Stable?",
        yesIndex: 4,
        noIndex: 5,
        choices: {
            yes: "Stable - SFT Clock",
            no: "Not Stable",
        },
        ...defaultQuestion
    },
    {
        id: 2,
        question: "OURS CM/MD Review - Clinicals Sufficient?",
        tooltip: "Per CM or MD, are there sufficient clinicals?",
        breadcrumb: "Suff. Clinicals?",
        yesIndex: 3,
        noIndex: 6,
        choices: {
            yes: "Yes",
            no: "No",
        },
        ...defaultQuestion
    },
    {
        id: 3,
        question: "Upon OURS CM/MD Review?",
        tooltip: "After case review, is patient considered stable?",
        breadcrumb: "OURS Stable?",
        yesIndex: 7,
        noIndex: null,
        choices: {
            yes: "Stable",
            no: "Not Stable",
        },
        yesUMDecision: null,
        noUMDecision: {
            action: "Unstable Admit Courtesy Letter",
            reason: "Confirmation of Courtesy - Unstable",
            letter: "CCN",
            exception: null
        },
        startTransfer: false
    },
    {
        id: 4,
        question: "Clinicals Received?",
        tooltip: "Have you received clinicals today?",
        breadcrumb: "Clinicals?",
        yesIndex: 8,
        noIndex: null,
        choices: {
            yes: "Yes",
            no: "No",
        },
        yesUMDecision: null,
        noUMDecision: {
            action: "Not Authorized",
            reason: "Provider Non Authorized - Failure to Cooperate with Transfer",
            letter: "FTCWT",
            exception: 19
        },
        startTransfer: false
    },
    {
        id: 5,
        question: "Clinicals Received?",
        tooltip: "Have you received clinicals today?",
        breadcrumb: "Clinicals?",
        yesIndex: 9,
        noIndex: 10,
        choices: {
            yes: "Yes",
            no: "No",
        },
        ...defaultQuestion
    },
    {
        id: 6,
        question: "Request Clinicals - Received within 2 hours?",
        tooltip: "If clinicals have been requested, has it been within 2 hours?",
        breadcrumb: "Clins Requested?",
        yesIndex: 11,
        noIndex: null,
        choices: {
            yes: "Yes",
            no: "No",
        },
        yesUMDecision: null,
        noUMDecision: {
            action: "No Authorization Requested (Unknown Stability)",
            reason: "No Clinicals Received or Insufficient - Send Confirmation of Courtesy Notification",
            letter: "CCN",
            exception: null
        },
        startTransfer: false
    },
    {
        id: 7,
        question: "Verbal NKF SFT?",
        tooltip: "Did NKF provide verbal stability?",
        breadcrumb: "NKF SFT?",
        yesIndex: 12,
        noIndex: null,
        choices: {
            yes: "Yes",
            no: "No",
        },
        yesUMDecision: null,
        noUMDecision: {
            action: "Not authorized",
            reason: "Provider Non-Authorized - Anticipated Unauthorized Post-Stabilization Care",
            letter: "UPSC",
            exception: 19
        },
        startTransfer: true
    },
    {
        id: 8,
        question: "OURS MD/CM Review Clinicals - Sufficient?",
        tooltip: "Per OURS MD or CM, are there sufficient clinicals?",
        breadcrumb: "Suff. Clins?",
        yesIndex: 13,
        noIndex: null,
        choices: {
            yes: "Yes",
            no: "No",
        },
        yesUMDecision: null,
        noUMDecision: {
            action: "Not Authorized",
            reason: "Provider Non Authorized - Failure to Cooperate with Transfer",
            letter: "FTCWT",
            exception: null
        },
        startTransfer: false
    },
    {
        id: 9,
        question: "OURS CM/MD Clinicals Sufficient?",
        tooltip: "Per OURS MD or CM, are there sufficient clinicals?",
        breadcrumb: "Suff. Clins?",
        yesIndex: 14,
        noIndex: 10,
        choices: {
            yes: "Yes",
            no: "No",
        },
        yesUMDecision: null,
        noUMDecision: null,
        startTransfer: false
    },
    {
        id: 10,
        question: "Request Clinicals - Received within 2 Hours?",
        tooltip: "After Requesting Clinicals, Received within 2 Hours?",
        breadcrumb: "Clins Rcvd?",
        yesIndex: 14,
        noIndex: null,
        choices: {
            yes: "Yes",
            no: "No",
        },
        yesUMDecision: null,
        noUMDecision: {
            action: "No Authorization Requested (Unknown Stability)",
            reason: "No Clinicals Received or Unsufficient - Send Confirmation of Courtesy Notification",
            letter: "CCN",
            exception: null
        },
        startTransfer: false
    },
    {
        id: 11,
        question: "OURS CM/MD Reviews Clinicals - Sufficient?",
        tooltip: "Per OURS MD or CM, are there sufficient clinicals?",
        breadcrumb: "Suff. Clins?",
        yesIndex: 15,
        noIndex: null,
        choices: {
            yes: "Yes",
            no: "No",
        },
        yesUMDecision: null,
        noUMDecision: {
            action: "No Authorization Requested (Unknown Stability)",
            reason: "No Clinicals Received or Insufficient - Send Confirmation of Courtesy Notification",
            letter: "CCN",
            exception: null
        },
        startTransfer: false
    },
    {
        id: 12,
        question: "SFT Clock",
        tooltip: "Stable for Transfer Clock Started",
        breadcrumb: "SFT Clock",
        yesIndex: null,
        noIndex: null,
        choices: {
            yes: "KP Barrier to Transfer",
            no: "NKFH Barrier to Transfer",
        },
        yesUMDecision: {
            action: "Authorized Stable",
            reason: "Post Stabilization Care",
            letter: "Auth (PAD)",
            exception: null
        },
        noUMDecision: {
            action: "Not Authorized",
            reason: "Provider Non-Authorized - Anticipated Unauthorized Post Stabilization Care",
            letter: "UPSC",
            exception: null
        },
        startTransfer: false
    },
    {
        id: 13,
        question: "Upon OURS CM/MD Review",
        tooltip: "After OURS Review, Is Patient Stable?",
        breadcrumb: "OURS Review",
        yesIndex: 16,
        noIndex: null,
        choices: {
            yes: "Stable",
            no: "Not Stable",
        },
        yesUMDecision: null,
        noUMDecision: {
            action: "Authorized Stable",
            reason: "Post-Stabilization Care",
            letter: "AUTH (PAD)",
            exception: null
        },
        startTransfer: false
    },
    {
        id: 14,
        question: "Upon OURS CM/MD Review",
        tooltip: "After OURS Review, Is Patient Stable?",
        breadcrumb: "OURS Review",
        yesIndex: null,
        noIndex: null,
        choices: {
            yes: "Stable",
            no: "Not Stable",
        },
        yesUMDecision: {
            action: "Not Authorized",
            reason: "Provider Non Authorized - Anticipated Unauthorized Post-Stabilization Care",
            letter: "UPSC",
            exception: 17
        },
        noUMDecision: {
            action: "Unstable Admit Courtesy Letter",
            reason: "Confirmation of Courtesy - Unstable",
            letter: "CCN",
            exception: null
        },
        startTransfer: false
    },
    {
        id: 15,
        question: "Upon OURS CM/MD Review",
        tooltip: "After OURS Review, Is Patient Stable?",
        breadcrumb: "OURS Review?",
        yesIndex: 18,
        noIndex: null,
        choices: {
            yes: "Stable",
            no: "Not Stable",
        },
        yesUMDecision: null,
        noUMDecision: {
            action: "Unstable Admit Courtesy Letter",
            reason: "Confirmation of Courtesy - Unstable",
            letter: "CCN",
            exception: null
        },
        startTransfer: false
    },
    {
        id: 16,
        question: "Start transfer",
        tooltip: "Transfer started. Any barriers to transfer?",
        breadcrumb: "Start Transfer",
        yesIndex: null,
        noIndex: null,
        choices: {
            yes: "KP Barrier To Transfer",
            no: "NKFH Barrier To Transfer",
        },
        yesUMDecision: {
            action: "Authorized Stable",
            reason: "Post-Stabilization Care",
            letter: "Auth (PAD)",
            exception: null
        },
        noUMDecision: {
            action: "Not Authorized",
            reason: "Provider Non-Authorized - Failure to Cooperate with Transfer",
            letter: "FTCWT",
            exception: null
        },
        startTransfer: true
    },
    {
        id: 17,
        question: "If Any Non-KFH Verbal Stability Given Subsequently",
        tooltip: "After Denial, Was Verbal Stability Given by NKF?",
        breadcrumb: "Subsequent Verbal",
        yesIndex: 20,
        noIndex: null,
        choices: {
            yes: "SFT Clock",
            no: "Null",
        },
        yesUMDecision: null,
        noUMDecision: null,
        startTransfer: false
    },
    {
        id: 18,
        question: "Verbal NKF SFT",
        tooltip: "Did NKFH Provide Verbal Stability?",
        breadcrumb: "NKF Verbal",
        yesIndex: 21,
        noIndex: null,
        choices: {
            yes: "SFT Clock",
            no: "No",
        },
        yesUMDecision: null,
        noUMDecision: {
            action: "Not Authorized",
            reason: "Provider Non-Authorized - Anticipated Unauthorized Post-Stabilization Care",
            letter: "UPSC",
            exception: null
        },
        startTransfer: false
    },
    {
        id: 19,
        question: "If Any Non-KFH Verbal Stability Given Subsequently",
        tooltip: "After Denial, Was Verbal Stability Given by NKF?",
        breadcrumb: "Subsequent Verbal",
        yesIndex: 22,
        noIndex: null,
        choices: {
            yes: "SFT Clock",
            no: "Null",
        },
        yesUMDecision: null,
        noUMDecision: null,
        startTransfer: false
    },
    {
        id: 20,
        question: "Start Transfer",
        tooltip: "Transfer started. Any barriers to transfer?",
        breadcrumb: "Start Transfer",
        yesIndex: null,
        noIndex: null,
        choices: {
            yes: "KP Barrier To Transfer",
            no: "NKFH Barrier To Transfer",
        },
        yesUMDecision: {
            action: "Authorized Stable",
            reason: "Post Stabilization Care",
            letter: "Auth (PAD)",
            exception: null
        },
        noUMDecision: {
            action: "Not Authorized",
            reason: "Provider Non-Authorized - Failure to Cooperate with Transfer",
            letter: "FTCWT",
            exception: null
        },
        startTransfer: true
    },
    {
        id: 21,
        question: "Start Transfer",
        tooltip: "Transfer started. Any barriers to transfer?",
        breadcrumb: "Start Transfer",
        yesIndex: null,
        noIndex: null,
        choices: {
            yes: "KP Barrier To Transfer",
            no: "NKFH Barrier To Transfer",
        },
        yesUMDecision: {
            action: "Authorized Stable",
            reason: "Post Stabilization Care",
            letter: "Auth (PAD)",
            exception: null
        },
        noUMDecision: {
            action: "Not Authorized",
            reason: "Provider Non-Authorized - Failure to Cooperate with Transfer",
            letter: "FTCWT",
            exception: null
        },
        startTransfer: true
    },
    {
        id: 22,
        question: "Start Transfer",
        tooltip: "Transfer started. Any barriers to transfer?",
        breadcrumb: "Start Transfer",
        yesIndex: null,
        noIndex: null,
        choices: {
            yes: "KP Barrier To Transfer",
            no: "NKFH Barrier To Transfer",
        },
        yesUMDecision: {
            action: "Authorized Stable",
            reason: "Post Stabilization Care",
            letter: "Auth (PAD)",
            exception: null
        },
        noUMDecision: {
            action: "Not Authorized",
            reason: "Provider Non-Authorized - Failure to Cooperate with Transfer",
            letter: "FTCWT",
            exception: null
        },
        startTransfer: true
    },

]
const authQuestions: QuestionInterface[] = [
    {
        id: 0,
        question: "Clinicals/Transfer Order Received?",
        tooltip: "Did you receive clinicals or transfer order?",
        breadcrumb: "Clins/Tx Order",
        yesIndex: 1,
        noIndex: 2,
        choices: {
            yes: "Yes",
            no: "No",
        },
        ...defaultQuestion
    },
    {
        id: 1,
        question: "OURS CM/MD Reviews Clinicals - Sufficient?",
        tooltip: "Per OURS, Sufficient Clinicals Receieved?",
        breadcrumb: "Sufficient Clinicals",
        yesIndex: 3,
        noIndex: 2,
        choices: {
            yes: "Yes",
            no: "No",
        },
        ...defaultQuestion
    },
    {
        id: 2,
        question: "Request Clinicals - Received Within 2 Hours?",
        tooltip: "After Requesting Clinicals, Were They Received Within 2 Hours?",
        breadcrumb: "Clins Requested",
        yesIndex: 3,
        noIndex: null,
        choices: {
            yes: "Yes",
            no: "No",
        },
        yesUMDecision: null,
        noUMDecision: {
            action: "Not Authorized",
            reason: "Reminder - Further Care not Authorized",
            letter: "FCNA",
            exception: null
        },
        startTransfer: false
    },
    {
        id: 3,
        question: "Upon OURS CM/MD Review?",
        tooltip: "After Reviewing, Is Patient Considered Stable?",
        breadcrumb: "OURS Review",
        yesIndex: 4,
        noIndex: null,
        choices: {
            yes: "Stable",
            no: "Not Stable",
        },
        yesUMDecision: null,
        noUMDecision: {
            action: "Authorized Stable",
            reason: "Post Stabilization Care",
            letter: "Auth (PAD)",
            exception: null
        },
        startTransfer: false
    },
    {
        id: 4,
        question: "Start Transfer",
        tooltip: "What are the Barriers to Transfer?",
        breadcrumb: "Transfer",
        yesIndex: null,
        noIndex: null,
        choices: {
            yes: "KP Barrier To Transfer",
            no: "NKF Barrier To Transfer",
        },
        yesUMDecision: {
            action: "Authorized Stable",
            reason: "Post Stabilization Care",
            letter: "Auth (PAD)",
            exception: null
        },
        noUMDecision: {
            action: "Not Authorized",
            reason: "Provider Non-Authorized - Failure to Cooperate with Transfer",
            letter: "FTCWT",
            exception: null
        },
        startTransfer: true
    },
]
const upscQuestions: QuestionInterface[] = [
    {
        id: 0,
        question: "Clinicals/Transfer Order Received?",
        tooltip: "Did you receive clinicals or transfer order?",
        breadcrumb: "Clins/Tx Order",
        yesIndex: 1,
        noIndex: 2,
        choices: {
            yes: "Yes",
            no: "No",
        },
        ...defaultQuestion
    },
    {
        id: 1,
        question: "OURS CM/MD Reviews Clinicals - Sufficient?",
        tooltip: "Per OURS, Sufficient Clinicals Receieved?",
        breadcrumb: "Sufficient Clinicals",
        yesIndex: 3,
        noIndex: 2,
        choices: {
            yes: "Yes",
            no: "No",
        },
        ...defaultQuestion
    },
    {
        id: 2,
        question: "Request Clinicals - Received Within 2 Hours?",
        tooltip: "After Requesting Clinicals, Were They Received Within 2 Hours?",
        breadcrumb: "Clins Requested",
        yesIndex: 3,
        noIndex: null,
        choices: {
            yes: "Yes",
            no: "No",
        },
        yesUMDecision: null,
        noUMDecision: {
            action: "Not Authorized",
            reason: "Reminder - Unauthorized Post Stabilization Care",
            letter: "RUPSC (Send Daily)",
            exception: null
        },
        startTransfer: false
    },
    {
        id: 3,
        question: "Upon OURS CM/MD Review?",
        tooltip: "After Reviewing, Is Patient Considered Stable?",
        breadcrumb: "OURS Review",
        yesIndex: 5,
        noIndex: 4,
        choices: {
            yes: "Stable",
            no: "Unstable",
        },
        ...defaultQuestion
    },
    {
        id: 4,
        question: "Previous Day Review Outcome",
        tooltip: "Select Review Outcome From Yesterday",
        breadcrumb: "Prev. Review Outcome",
        yesIndex: null,
        noIndex: null,
        choices: {
            yes: "Reminder - Unauthorized Post Stabilization Care (RUPSC)",
            no: "Provider Non-Authorized - Anticipated Unauthorized Post-Stabilization Care (UPSC)",
        },
        yesUMDecision: {
            action: "Not Authorized",
            reason: "Reminder - Unauthorized Post Stabilization Care (PAD)",
            letter: "DO NOT SEND LETTER",
            exception: null
        },
        noUMDecision: {
            action: "Not Authorized",
            reason: "Provider Non-Authorized - Anticipated Unauthorized Post-Stabilization Care (PAD)",
            letter: "DO NOT SEND LETTER",
            exception: null
        },
        startTransfer: false
    },
    {
        id: 5,
        question: "Verbal NKF SFT?",
        tooltip: "Did NKFH Provide Verbal Stability?",
        breadcrumb: "NKF Verbal",
        yesIndex: 6,
        noIndex: null,
        choices: {
            yes: "Yes",
            no: "No",
        },
        yesUMDecision: null,
        noUMDecision: {
            action: "Not Authorized",
            reason: "Reminder - Unauthorized Post Stabilization Care",
            letter: "RUPSC (Send Daily)",
            exception: null
        },
        startTransfer: true
    },
    {
        id: 6,
        question: "SFT Clock",
        tooltip: "What Was The Barrier To Transfer?",
        breadcrumb: "Transfer Barrier",
        yesIndex: 4,
        noIndex: null,
        choices: {
            yes: "KP Barrier To Transfer",
            no: "NKFH Barrier To Transfer",
        },
        yesUMDecision: null,
        noUMDecision: {
            action: "Not Authorized",
            reason: "Provider Non-Authorized - Failure To Cooperate with Transfer",
            letter: "FTCWT (Send Daily)",
            exception: null
        },
        startTransfer: false
    },
]
const fcnaQuestions: QuestionInterface[] = [
    {
        id: 0,
        question: "Clinicals/Transfer Order Received?",
        tooltip: "Did you receive clinicals or transfer order?",
        breadcrumb: "Clins/Tx Order",
        yesIndex: 1,
        noIndex: 2,
        choices: {
            yes: "Yes",
            no: "No",
        },
        ...defaultQuestion
    },
    {
        id: 1,
        question: "OURS CM/MD Reviews Clinicals - Sufficient?",
        tooltip: "Per OURS, Sufficient Clinicals Receieved?",
        breadcrumb: "Sufficient Clinicals",
        yesIndex: 3,
        noIndex: 2,
        choices: {
            yes: "Yes",
            no: "No",
        },
        ...defaultQuestion
    },
    {
        id: 2,
        question: "Request Clinicals - Received Within 2 Hours?",
        tooltip: "After Requesting Clinicals, Were They Received Within 2 Hours?",
        breadcrumb: "Clins Requested",
        yesIndex: 3,
        noIndex: 4,
        choices: {
            yes: "Yes",
            no: "No",
        },
        yesUMDecision: null,
        noUMDecision: null,
        startTransfer: false
    },
    {
        id: 3,
        question: "OURS CM/MD Review - Stable Or Unstable?",
        tooltip: "After Reviewing, Is Patient Considered Stable?",
        breadcrumb: "OURS Review",
        yesIndex: 6,
        noIndex: 5,
        choices: {
            yes: "Stable",
            no: "Unstable",
        },
        ...defaultQuestion
    },
    {
        id: 4,
        question: "Previous Day Review Outcome",
        tooltip: "Select Review Outcome From Yesterday",
        breadcrumb: "Prev. Review Outcome",
        yesIndex: null,
        noIndex: null,
        choices: {
            yes: "Provider Non Authorized - Failure To Cooperate With Transfer",
            no: "Provider Non-Authorized - Further Care Not Authorized",
        },
        yesUMDecision: {
            action: "Not Authorized",
            reason: "Provider Non-Authorized - Failure To Cooperate With Transfer",
            letter: "FTCWT (SEND DAILY)",
            exception: null
        },
        noUMDecision: {
            action: "Not Authorized",
            reason: "Reminder - Further Care Not Authorized",
            letter: "FCNA (SEND DAILY)",
            exception: null
        },
        startTransfer: false
    },
    {
        id: 5,
        question: "Previous Day Review Outcome",
        tooltip: "Select Review Outcome From Yesterday",
        breadcrumb: "Prev. Review Outcome",
        yesIndex: null,
        noIndex: null,
        choices: {
            yes: "Provider Non Authorized - Failure To Cooperate With Transfer",
            no: "Provider Non-Authorized - Further Care Not Authorized",
        },
        yesUMDecision: {
            action: "Not Authorized",
            reason: "Provider Non-Authorized - Failure To Cooperate With Transfer (PAD)",
            letter: "DO NOT SEND LETTER",
            exception: null
        },
        noUMDecision: {
            action: "Not Authorized",
            reason: "Reminder - Further Care Not Authorized (PAD)",
            letter: "DO NOT SEND LETTER",
            exception: null
        },
        startTransfer: false
    },
    {
        id: 6,
        question: "Start Transfer",
        tooltip: "What Was The Barrier To Transfer?",
        breadcrumb: "Transfer Barrier",
        yesIndex: 5,
        noIndex: null,
        choices: {
            yes: "KP Barrier To Transfer",
            no: "NKFH Barrier To Transfer",
        },
        yesUMDecision: null,
        noUMDecision: {
            action: "Not Authorized",
            reason: "Provider Non-Authorized - Failure To Cooperate With Transfer",
            letter: "FTCWT (SEND DAILY)",
            exception: null
        },
        startTransfer: true
    },
]
//  ** For all decisions, no will be represented by 0 and yes will equal 1.
const MainCard = () => {
    const [questionStack, setQuestionStack] = useState<QuestionInterface[]>([ccnQuestions[0]])
    const [currentQuestion, setCurrentQuestion] = useState(ccnQuestions[0])
    const [activeTab, setActiveTab] = useState<string>("ccn")
    const [decisionMade, setDecisionMade] = useState<UMDecisionInterface | null>(null)
    const spanMotionAnimation = {
        initial: { scale: 0.5 },
        animate: { scale: 1 },
        exit: { opacity: 0, scale: 0.5 },
        transition: { times: [0, 0.2, 1] }
    }
    const handleBreadcrumbClick = (idx: number) => {
        setQuestionStack((prevStack) => {
            const newStack = prevStack.slice(0, idx + 1)
            setCurrentQuestion(newStack[newStack.length - 1])
            return newStack
        })
        setDecisionMade(null)
    }
    const handleQuestionClick = (e: React.MouseEvent<HTMLButtonElement>, choice: string, questions: QuestionInterface[]) => {
        e.preventDefault()
        if (choice == "yes" && currentQuestion.yesIndex) {
            const newQuestion = questions.find(question => question.id == currentQuestion.yesIndex)
            if (newQuestion) {
                setCurrentQuestion(newQuestion)
                setQuestionStack(prevStack => [...prevStack, newQuestion])
                if (newQuestion.startTransfer) {
                    toast.success("Start Transfer")
                }
            }
        } else if (choice == "no" && currentQuestion.noIndex) {
            const newQuestion = questions.find(question => question.id == currentQuestion.noIndex)
            if (newQuestion) {
                setCurrentQuestion(newQuestion)
                setQuestionStack(prevStack => [...prevStack, newQuestion])
            }
        } else if (choice == "no" && currentQuestion.noUMDecision) {
            setDecisionMade(currentQuestion.noUMDecision)
            if (currentQuestion.noUMDecision.letter == "DO NOT SEND LETTER") {
                toast.warning("Do Not Send Letter For This Review Outcome")
            }
        } else if (choice == "yes" && currentQuestion.yesUMDecision) {
            setDecisionMade(currentQuestion.yesUMDecision)
            if (currentQuestion.yesUMDecision.letter == "DO NOT SEND LETTER") {
                toast.warning("Do Not Send Letter For This Review Outcome")
            }
        }
    }
    const handleExceptionClick = (questions: QuestionInterface[]) => {
        if (decisionMade?.exception) {
            setDecisionMade(null)
            const newQuestion = questions.find(question => question.id == decisionMade.exception)
            if (newQuestion) {
                setCurrentQuestion(newQuestion)
                setQuestionStack(prevStack => [...prevStack, newQuestion])
            }
        }
    }
    const handleTabChange = (value: string) => {
        setActiveTab(value)
        if (value == "ccn") {
            setQuestionStack([ccnQuestions[0]])
            setCurrentQuestion(ccnQuestions[0])
        } else if (value == 'auth') {
            setQuestionStack([authQuestions[0]])
            setCurrentQuestion(authQuestions[0])
        } else if (value == "upsc") {
            setQuestionStack([upscQuestions[0]])
            setCurrentQuestion(upscQuestions[0])
        } else if (value == "fcna") {
            setQuestionStack([fcnaQuestions[0]])
            setCurrentQuestion(fcnaQuestions[0])
        }
        setDecisionMade(null)
    }
    const resetQuestionaire = () => {
        setActiveTab("ccn")
        setCurrentQuestion(ccnQuestions[0])
        setQuestionStack([ccnQuestions[0]])
        setDecisionMade(null)
    }
    return (
        <>
            <div className="container mx-auto px-10 py-4">
                <form className="grid w-full items-start gap-6">
                    <fieldset className="grid gap-6 rounded-lg border p-4">
                        <legend className="-ml-1 px-1 text-sm font-bold">Select Tab for Previous Review Outcome</legend>
                        <div className="col-span-full">
                            {questionStack.length > 1 && (
                                <Breadcrumb>
                                    <BreadcrumbList className='text-xs'>
                                        {questionStack.map((question: QuestionInterface, idx) => (
                                            <BreadcrumbItem className='border p-1 border-blue-400 rounded-lg font-bold hover:bg-blue-500 hover:text-white hover:cursor-pointer' onClick={() => handleBreadcrumbClick(idx)} key={question.id}>
                                                <BreadcrumbLink className='hover:cursor-pointer hover:text-white' >
                                                    {question.breadcrumb}
                                                </BreadcrumbLink>
                                                <BreadcrumbSeparator />
                                            </BreadcrumbItem>
                                        ))}
                                        {decisionMade && (
                                            <BreadcrumbItem className='border p-2 border-blue-400 pl-2 rounded-lg font-bold hover:bg-blue-500 hover:text-white hover:cursor-pointer'>
                                                UM Decision
                                            </BreadcrumbItem>
                                        )}
                                    </BreadcrumbList>
                                </Breadcrumb>
                            )}
                        </div>
                        <div className="col-span-full my-4">
                            <div className='flex w-full justify-center'>
                                <Tabs value={activeTab} defaultValue="ccn" onValueChange={handleTabChange} className="w-[700px]">
                                    <TabsList className="grid w-full grid-cols-5">
                                        <TabsTrigger value="ccn">CCN</TabsTrigger>
                                        <TabsTrigger value="auth">Auth</TabsTrigger>
                                        <TabsTrigger value="upsc">UPSC / RUPSC</TabsTrigger>
                                        <TabsTrigger value="fcna">FCNA / FTCWT</TabsTrigger>
                                        <TabsTrigger value="noAuth">No Auth Req</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="ccn">
                                        {decisionMade ? (
                                            // UM DECISION CARD
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className={cn('flex flex-col items-center justify-center space-y-2', decisionMade.action == "Authorized Stable" ? "text-green-500" : decisionMade.letter == "CCN" ? "text-yellow-500" : 'text-red-500')}>
                                                        <motion.div
                                                            {...spanMotionAnimation}
                                                        >
                                                            <motion.span
                                                                key={currentQuestion.id}
                                                                {...spanMotionAnimation}
                                                                className='font-bold'
                                                            >
                                                                Action:
                                                            </motion.span>
                                                            <motion.span
                                                                key={decisionMade.action}
                                                                className=''
                                                                {...spanMotionAnimation}
                                                            >
                                                                {decisionMade.action}
                                                            </motion.span>
                                                        </motion.div>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex flex-col space-y-2 justify-center items-center mt-12 text-center text-blue-500">
                                                    <motion.span
                                                        key={decisionMade.reason}
                                                        {...spanMotionAnimation}
                                                    >
                                                        <span className='font-bold'>Reason: </span> {decisionMade.reason}
                                                    </motion.span>
                                                </CardContent>
                                                <CardFooter className='mt-12 flex flex-col space-y-6 justify-center items-center text-yellow-800 font-extrabold text-xl'>
                                                    <motion.div
                                                        key={decisionMade.letter}
                                                        {...spanMotionAnimation}
                                                    >
                                                        <span className='font-bold'> Letter: </span> {decisionMade.letter}
                                                    </motion.div>
                                                    {decisionMade.exception && (
                                                        <motion.div
                                                            key={decisionMade.exception}
                                                            {...spanMotionAnimation}
                                                        >
                                                            <Button onClick={() => handleExceptionClick(ccnQuestions)} variant={"outline"}>
                                                                <Speech />
                                                                Verbal Given After?
                                                            </Button>
                                                        </motion.div>
                                                    )}
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <InfoIcon size={18} color='orange' className="text-gray-400" />
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader className='flex items-center justify-center'>
                                                                <DialogTitle> {currentQuestion.question} </DialogTitle>
                                                                <DialogDescription className='mt-4'>
                                                                    {currentQuestion.tooltip}
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="sm:justify-center flex justify-center items-center">
                                                                <DialogClose asChild>
                                                                    <Button type="button">
                                                                        Close
                                                                    </Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <RotateCcw color='blue' size={18} />
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader className='flex items-center justify-center'>
                                                                <DialogTitle>Are You Sure You'd Like To Restart?</DialogTitle>
                                                                <DialogDescription>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="sm:justify-center flex justify-center items-center">
                                                                <DialogClose asChild>
                                                                    <Button onClick={resetQuestionaire} type="button" variant="secondary">
                                                                        Yes
                                                                    </Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </CardFooter>
                                            </Card>
                                        ) : (
                                            // QUESTIONAIRE CARD
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className='flex items-center justify-center text-xl'>
                                                        <motion.span
                                                            key={currentQuestion.id}
                                                            {...spanMotionAnimation}
                                                        >
                                                            {currentQuestion.question}
                                                        </motion.span>
                                                    </CardTitle>
                                                </CardHeader>
                                                {/* Initial Render For Fax Vs. Verbal */}
                                                {questionStack.length === 1 ? (
                                                    <CardContent className="flex justify-around items-center mt-12">
                                                        <motion.div
                                                            className="space-y-1"
                                                            whileHover={{
                                                                scale: 1.05,
                                                                transition: { duration: 0.2 },
                                                            }}
                                                            whileTap={{ scale: 0.8 }}
                                                        >
                                                            <Button className='bg-blue-500 hover:bg-blue-300' onClick={(e) => handleQuestionClick(e, "no", ccnQuestions)}>
                                                                <MailCheckIcon />
                                                                {currentQuestion.choices.no}
                                                            </Button>
                                                        </motion.div>
                                                        <motion.div
                                                            className="space-y-1"
                                                            whileHover={{
                                                                scale: 1.05,
                                                                transition: { duration: 0.2 },
                                                            }}
                                                            whileTap={{ scale: 0.8 }}
                                                        >
                                                            <Button onClick={(e) => handleQuestionClick(e, "yes", ccnQuestions)} className='bg-green-500 hover:bg-green-800' variant={"default"}>
                                                                <Speech />
                                                                {currentQuestion.choices.yes}
                                                            </Button>
                                                        </motion.div>
                                                    </CardContent>
                                                ) : (
                                                    // ALL OTHER QUESTIONAIRE CHOICES
                                                    <CardContent className="flex justify-around items-center mt-12">
                                                        {/* X BUTTON IS CONDITIONALLY RENDERED */}
                                                        {currentQuestion.question != "If Any Non-KFH Verbal Stability Given Subsequently" && (
                                                            <motion.div
                                                                className="space-y-1"
                                                                whileHover={{
                                                                    scale: 1.05,
                                                                    transition: { duration: 0.2 },
                                                                }}
                                                                whileTap={{ scale: 0.8 }}
                                                            >
                                                                <Button onClick={(e) => handleQuestionClick(e, "no", ccnQuestions)} variant={"destructive"}>
                                                                    <X />
                                                                    {currentQuestion.choices.no}
                                                                </Button>
                                                            </motion.div>
                                                        )}
                                                        {/* YES BUTTON */}
                                                        <motion.div
                                                            className="space-y-1"
                                                            whileHover={{
                                                                scale: 1.05,
                                                                transition: { duration: 0.2 },
                                                            }}
                                                            whileTap={{ scale: 0.8 }}
                                                        >
                                                            <Button onClick={(e) => handleQuestionClick(e, "yes", ccnQuestions)} className='bg-green-500 hover:bg-green-400' variant={"default"}>
                                                                <Check />
                                                                {currentQuestion.choices.yes}
                                                            </Button>
                                                        </motion.div>
                                                    </CardContent>
                                                )}
                                                <CardFooter className='mt-12 flex items-center space-x-4 justify-center'>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <InfoIcon size={18} color='orange' className="text-gray-400" />
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader className='flex items-center justify-center'>
                                                                <DialogTitle> {currentQuestion.question} </DialogTitle>
                                                                <DialogDescription className='mt-4'>
                                                                    {currentQuestion.tooltip}
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="sm:justify-center flex justify-center items-center">
                                                                <DialogClose asChild>
                                                                    <Button type="button">
                                                                        Close
                                                                    </Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <RotateCcw color='blue' size={18} />
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader className='flex items-center justify-center'>
                                                                <DialogTitle>Are You Sure You'd Like To Restart?</DialogTitle>
                                                                <DialogDescription>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="sm:justify-center flex justify-center items-center">
                                                                <DialogClose asChild>
                                                                    <Button onClick={resetQuestionaire} type="button" variant="secondary">
                                                                        Yes
                                                                    </Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </CardFooter>
                                            </Card>
                                        )}
                                    </TabsContent>
                                    <TabsContent value='auth'>
                                        {decisionMade ? (
                                            // UM DECISION CARD
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className={cn('flex flex-col items-center justify-center space-y-2', decisionMade.action == "Authorized Stable" ? "text-green-500" : decisionMade.letter == "CCN" ? "text-yellow-500" : 'text-red-500')}>
                                                        <motion.div
                                                            {...spanMotionAnimation}
                                                        >
                                                            <motion.span
                                                                key={currentQuestion.id}
                                                                {...spanMotionAnimation}
                                                                className='font-bold'
                                                            >
                                                                Action:
                                                            </motion.span>
                                                            <motion.span
                                                                key={decisionMade.action}
                                                                className=''
                                                                {...spanMotionAnimation}
                                                            >
                                                                {decisionMade.action}
                                                            </motion.span>
                                                        </motion.div>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex flex-col space-y-2 justify-center items-center mt-12 text-center text-blue-500">
                                                    <motion.span
                                                        key={decisionMade.reason}
                                                        {...spanMotionAnimation}
                                                    >
                                                        <span className='font-bold'>Reason: </span> {decisionMade.reason}
                                                    </motion.span>
                                                </CardContent>
                                                <CardFooter className='mt-12 flex flex-col space-y-6 justify-center items-center text-yellow-800 font-extrabold text-xl'>
                                                    <motion.div
                                                        key={decisionMade.letter}
                                                        {...spanMotionAnimation}
                                                    >
                                                        <span className='font-bold'> Letter: </span> {decisionMade.letter}
                                                    </motion.div>
                                                    {decisionMade.exception && (
                                                        <motion.div
                                                            key={decisionMade.exception}
                                                            {...spanMotionAnimation}
                                                        >
                                                            <Button onClick={() => handleExceptionClick(authQuestions)} variant={"outline"}>
                                                                <Speech />
                                                                Verbal Given After?
                                                            </Button>
                                                        </motion.div>
                                                    )}
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <InfoIcon size={18} color='orange' className="text-gray-400" />
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader className='flex items-center justify-center'>
                                                                <DialogTitle> {currentQuestion.question} </DialogTitle>
                                                                <DialogDescription className='mt-4'>
                                                                    {currentQuestion.tooltip}
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="sm:justify-center flex justify-center items-center">
                                                                <DialogClose asChild>
                                                                    <Button type="button">
                                                                        Close
                                                                    </Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <RotateCcw color='blue' size={18} />
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader className='flex items-center justify-center'>
                                                                <DialogTitle>Are You Sure You'd Like To Restart?</DialogTitle>
                                                                <DialogDescription>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="sm:justify-center flex justify-center items-center">
                                                                <DialogClose asChild>
                                                                    <Button onClick={resetQuestionaire} type="button" variant="secondary">
                                                                        Yes
                                                                    </Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </CardFooter>
                                            </Card>
                                        ) : (
                                            // QUESTIONAIRE CARD
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className='flex items-center justify-center text-xl'>
                                                        <motion.span
                                                            key={currentQuestion.id}
                                                            {...spanMotionAnimation}
                                                        >
                                                            {currentQuestion.question}
                                                        </motion.span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex justify-around items-center mt-12">
                                                    {/* X BUTTON IS CONDITIONALLY RENDERED */}
                                                    {currentQuestion.question != "If Any Non-KFH Verbal Stability Given Subsequently" && (
                                                        <motion.div
                                                            className="space-y-1"
                                                            whileHover={{
                                                                scale: 1.05,
                                                                transition: { duration: 0.2 },
                                                            }}
                                                            whileTap={{ scale: 0.8 }}
                                                        >
                                                            <Button onClick={(e) => handleQuestionClick(e, "no", authQuestions)} variant={"destructive"}>
                                                                <X />
                                                                {currentQuestion.choices.no}
                                                            </Button>
                                                        </motion.div>
                                                    )}
                                                    {/* YES BUTTON */}
                                                    <motion.div
                                                        className="space-y-1"
                                                        whileHover={{
                                                            scale: 1.05,
                                                            transition: { duration: 0.2 },
                                                        }}
                                                        whileTap={{ scale: 0.8 }}
                                                    >
                                                        <Button onClick={(e) => handleQuestionClick(e, "yes", authQuestions)} className='bg-green-500 hover:bg-green-400' variant={"default"}>
                                                            <Check />
                                                            {currentQuestion.choices.yes}
                                                        </Button>
                                                    </motion.div>
                                                </CardContent>

                                                <CardFooter className='mt-12 flex items-center space-x-4 justify-center'>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <InfoIcon size={18} color='orange' className="text-gray-400" />
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader className='flex items-center justify-center'>
                                                                <DialogTitle> {currentQuestion.question} </DialogTitle>
                                                                <DialogDescription className='mt-4'>
                                                                    {currentQuestion.tooltip}
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="sm:justify-center flex justify-center items-center">
                                                                <DialogClose asChild>
                                                                    <Button type="button">
                                                                        Close
                                                                    </Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <RotateCcw color='blue' size={18} />
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader className='flex items-center justify-center'>
                                                                <DialogTitle>Are You Sure You'd Like To Restart?</DialogTitle>
                                                                <DialogDescription>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="sm:justify-center flex justify-center items-center">
                                                                <DialogClose asChild>
                                                                    <Button onClick={resetQuestionaire} type="button" variant="secondary">
                                                                        Yes
                                                                    </Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </CardFooter>
                                            </Card>
                                        )}
                                    </TabsContent>
                                    <TabsContent value='upsc'>
                                        {decisionMade ? (
                                            // UM DECISION CARD
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className={cn('flex flex-col items-center justify-center space-y-2', decisionMade.action == "Authorized Stable" ? "text-green-500" : decisionMade.letter == "CCN" ? "text-yellow-500" : 'text-red-500')}>
                                                        <motion.div
                                                            {...spanMotionAnimation}
                                                        >
                                                            <motion.span
                                                                key={currentQuestion.id}
                                                                {...spanMotionAnimation}
                                                                className='font-bold'
                                                            >
                                                                Action:
                                                            </motion.span>
                                                            <motion.span
                                                                key={decisionMade.action}
                                                                className=''
                                                                {...spanMotionAnimation}
                                                            >
                                                                {decisionMade.action}
                                                            </motion.span>
                                                        </motion.div>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex flex-col space-y-2 justify-center items-center mt-12 text-center text-blue-500">
                                                    <motion.span
                                                        key={decisionMade.reason}
                                                        {...spanMotionAnimation}
                                                    >
                                                        <span className='font-bold'>Reason: </span> {decisionMade.reason}
                                                    </motion.span>
                                                </CardContent>
                                                <CardFooter className='mt-12 flex flex-col space-y-6 justify-center items-center text-yellow-800 font-extrabold text-xl'>
                                                    <motion.div
                                                        key={decisionMade.letter}
                                                        {...spanMotionAnimation}
                                                    >
                                                        <span className='font-bold'> Letter: </span> {decisionMade.letter}
                                                    </motion.div>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <InfoIcon size={18} color='orange' className="text-gray-400" />
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader className='flex items-center justify-center'>
                                                                <DialogTitle> {currentQuestion.question} </DialogTitle>
                                                                <DialogDescription className='mt-4'>
                                                                    {currentQuestion.tooltip}
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="sm:justify-center flex justify-center items-center">
                                                                <DialogClose asChild>
                                                                    <Button type="button">
                                                                        Close
                                                                    </Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <RotateCcw color='blue' size={18} />
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader className='flex items-center justify-center'>
                                                                <DialogTitle>Are You Sure You'd Like To Restart?</DialogTitle>
                                                                <DialogDescription>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="sm:justify-center flex justify-center items-center">
                                                                <DialogClose asChild>
                                                                    <Button onClick={resetQuestionaire} type="button" variant="secondary">
                                                                        Yes
                                                                    </Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </CardFooter>
                                            </Card>
                                        ) : (
                                            // QUESTIONAIRE CARD
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className='flex items-center justify-center text-xl'>
                                                        <motion.span
                                                            key={currentQuestion.id}
                                                            {...spanMotionAnimation}
                                                        >
                                                            {currentQuestion.question}
                                                        </motion.span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className={cn("flex", currentQuestion.choices.no.length > 30 ? "flex-col h-full items-center justify-self-center gap-y-8 " : "justify-around items-center mt-12")}>
                                                    <motion.div
                                                        className="space-y-1"
                                                        whileHover={{
                                                            scale: 1.05,
                                                            transition: { duration: 0.2 },
                                                        }}
                                                        whileTap={{ scale: 0.8 }}
                                                    >
                                                        <Button onClick={(e) => handleQuestionClick(e, "no", upscQuestions)} className={cn(currentQuestion.choices.yes.length > 30 ? "bg-purple-500 hover:bg-purple-400" : 'bg-red-500 hover:bg-red-400')} variant={"default"}>
                                                            <X />
                                                            {currentQuestion.choices.no}
                                                        </Button>
                                                    </motion.div>
                                                    {/* YES BUTTON */}
                                                    <motion.div
                                                        className="space-y-1"
                                                        whileHover={{
                                                            scale: 1.05,
                                                            transition: { duration: 0.2 },
                                                        }}
                                                        whileTap={{ scale: 0.8 }}
                                                    >
                                                        <Button onClick={(e) => handleQuestionClick(e, "yes", upscQuestions)} className={cn(currentQuestion.choices.yes.length > 30 ? "bg-blue-500 hover:bg-blue-400" : 'bg-green-500 hover:bg-green-400')} >
                                                            <Check />
                                                            {currentQuestion.choices.yes}
                                                        </Button>
                                                    </motion.div>
                                                </CardContent>

                                                <CardFooter className='mt-12 flex items-center space-x-4 justify-center'>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <InfoIcon size={18} color='orange' className="text-gray-400" />
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader className='flex items-center justify-center'>
                                                                <DialogTitle> {currentQuestion.question} </DialogTitle>
                                                                <DialogDescription className='mt-4'>
                                                                    {currentQuestion.tooltip}
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="sm:justify-center flex justify-center items-center">
                                                                <DialogClose asChild>
                                                                    <Button type="button">
                                                                        Close
                                                                    </Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <RotateCcw color='blue' size={18} />
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader className='flex items-center justify-center'>
                                                                <DialogTitle>Are You Sure You'd Like To Restart?</DialogTitle>
                                                                <DialogDescription>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="sm:justify-center flex justify-center items-center">
                                                                <DialogClose asChild>
                                                                    <Button onClick={resetQuestionaire} type="button" variant="secondary">
                                                                        Yes
                                                                    </Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </CardFooter>
                                            </Card>
                                        )}
                                    </TabsContent>
                                    <TabsContent value='fcna'>
                                        {decisionMade ? (
                                            // UM DECISION CARD
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className={cn('flex flex-col items-center justify-center space-y-2', decisionMade.action == "Authorized Stable" ? "text-green-500" : decisionMade.letter == "CCN" ? "text-yellow-500" : 'text-red-500')}>
                                                        <motion.div
                                                            {...spanMotionAnimation}
                                                        >
                                                            <motion.span
                                                                key={currentQuestion.id}
                                                                {...spanMotionAnimation}
                                                                className='font-bold'
                                                            >
                                                                Action:
                                                            </motion.span>
                                                            <motion.span
                                                                key={decisionMade.action}
                                                                className=''
                                                                {...spanMotionAnimation}
                                                            >
                                                                {decisionMade.action}
                                                            </motion.span>
                                                        </motion.div>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex flex-col space-y-2 justify-center items-center mt-12 text-center text-blue-500">
                                                    <motion.span
                                                        key={decisionMade.reason}
                                                        {...spanMotionAnimation}
                                                    >
                                                        <span className='font-bold'>Reason: </span> {decisionMade.reason}
                                                    </motion.span>
                                                </CardContent>
                                                <CardFooter className='mt-12 flex flex-col space-y-6 justify-center items-center text-yellow-800 font-extrabold text-xl'>
                                                    <motion.div
                                                        key={decisionMade.letter}
                                                        {...spanMotionAnimation}
                                                    >
                                                        <span className='font-bold'> Letter: </span> {decisionMade.letter}
                                                    </motion.div>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <InfoIcon size={18} color='orange' className="text-gray-400" />
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader className='flex items-center justify-center'>
                                                                <DialogTitle> {currentQuestion.question} </DialogTitle>
                                                                <DialogDescription className='mt-4'>
                                                                    {currentQuestion.tooltip}
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="sm:justify-center flex justify-center items-center">
                                                                <DialogClose asChild>
                                                                    <Button type="button">
                                                                        Close
                                                                    </Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <RotateCcw color='blue' size={18} />
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader className='flex items-center justify-center'>
                                                                <DialogTitle>Are You Sure You'd Like To Restart?</DialogTitle>
                                                                <DialogDescription>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="sm:justify-center flex justify-center items-center">
                                                                <DialogClose asChild>
                                                                    <Button onClick={resetQuestionaire} type="button" variant="secondary">
                                                                        Yes
                                                                    </Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </CardFooter>
                                            </Card>
                                        ) : (
                                            // QUESTIONAIRE CARD
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className='flex items-center justify-center text-xl'>
                                                        <motion.span
                                                            key={currentQuestion.id}
                                                            {...spanMotionAnimation}
                                                        >
                                                            {currentQuestion.question}
                                                        </motion.span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className={cn("flex", currentQuestion.choices.no.length > 30 ? "flex-col h-full items-center justify-self-center gap-y-8 " : "justify-around items-center mt-12")}>
                                                    <motion.div
                                                        className="space-y-1"
                                                        whileHover={{
                                                            scale: 1.05,
                                                            transition: { duration: 0.2 },
                                                        }}
                                                        whileTap={{ scale: 0.8 }}
                                                    >
                                                        <Button onClick={(e) => handleQuestionClick(e, "no", fcnaQuestions)} className={cn(currentQuestion.choices.yes.length > 30 ? "bg-purple-500 hover:bg-purple-400" : 'bg-red-500 hover:bg-red-400')} variant={"default"}>
                                                            <X />
                                                            {currentQuestion.choices.no}
                                                        </Button>
                                                    </motion.div>
                                                    {/* YES BUTTON */}
                                                    <motion.div
                                                        className="space-y-1"
                                                        whileHover={{
                                                            scale: 1.05,
                                                            transition: { duration: 0.2 },
                                                        }}
                                                        whileTap={{ scale: 0.8 }}
                                                    >
                                                        <Button onClick={(e) => handleQuestionClick(e, "yes", fcnaQuestions)} className={cn(currentQuestion.choices.yes.length > 30 ? "bg-blue-500 hover:bg-blue-400" : 'bg-green-500 hover:bg-green-400')} >
                                                            <Check />
                                                            {currentQuestion.choices.yes}
                                                        </Button>
                                                    </motion.div>
                                                </CardContent>

                                                <CardFooter className='mt-12 flex items-center space-x-4 justify-center'>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <InfoIcon size={18} color='orange' className="text-gray-400" />
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader className='flex items-center justify-center'>
                                                                <DialogTitle> {currentQuestion.question} </DialogTitle>
                                                                <DialogDescription className='mt-4'>
                                                                    {currentQuestion.tooltip}
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="sm:justify-center flex justify-center items-center">
                                                                <DialogClose asChild>
                                                                    <Button type="button">
                                                                        Close
                                                                    </Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <RotateCcw color='blue' size={18} />
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader className='flex items-center justify-center'>
                                                                <DialogTitle>Are You Sure You'd Like To Restart?</DialogTitle>
                                                                <DialogDescription>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="sm:justify-center flex justify-center items-center">
                                                                <DialogClose asChild>
                                                                    <Button onClick={resetQuestionaire} type="button" variant="secondary">
                                                                        Yes
                                                                    </Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </CardFooter>
                                            </Card>
                                        )}
                                    </TabsContent>
                                    <TabsContent value='noAuth'>
                                        <Card>
                                            <CardHeader className='text-center font-bold text-xl'>Previous Review Outcome - <span className='text-orange-400'>No Auth Requested (Unknown Stability) </span></CardHeader>
                                            <CardContent className='text-center mt-8'>
                                                Retrospectively review "Review Outcome" gaps, rescind previous review outcome and render appropriate decision.
                                            </CardContent>
                                            <CardFooter className='flex justify-center items-center text-xs mt-8'>
                                                You may also refer back to Initial Notification/CCN workflow.
                                            </CardFooter>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div >
                    </fieldset>
                </form>
            </div>
        </>
    )
}

export default MainCard