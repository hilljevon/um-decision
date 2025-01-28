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
import { Check, Cross, LetterText, MailCheckIcon, Speech, X } from 'lucide-react'
import { toast } from 'sonner'
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
const initialNotificationQuestions: QuestionInterface[] = [
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

//  ** For all decisions, no will be represented by 0 and yes will equal 1.
const MainCard = () => {
    const [questionStack, setQuestionStack] = useState<QuestionInterface[]>([initialNotificationQuestions[0]])
    const [currentQuestion, setCurrentQuestion] = useState(initialNotificationQuestions[0])
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
    const handleQuestionClick = (e: React.MouseEvent<HTMLButtonElement>, choice: string) => {
        e.preventDefault()
        if (choice == "yes" && currentQuestion.yesIndex) {
            const newQuestion = initialNotificationQuestions.find(question => question.id == currentQuestion.yesIndex)
            if (newQuestion) {
                setCurrentQuestion(newQuestion)
                setQuestionStack(prevStack => [...prevStack, newQuestion])
                if (newQuestion.startTransfer) {
                    toast.success("Start Transfer")
                }
            }
        } else if (choice == "no" && currentQuestion.noIndex) {
            const newQuestion = initialNotificationQuestions.find(question => question.id == currentQuestion.noIndex)
            if (newQuestion) {
                setCurrentQuestion(newQuestion)
                setQuestionStack(prevStack => [...prevStack, newQuestion])
            }
        } else if (choice == "no" && currentQuestion.noUMDecision) {
            setDecisionMade(currentQuestion.noUMDecision)
        } else if (choice == "yes" && currentQuestion.yesUMDecision) {
            setDecisionMade(currentQuestion.yesUMDecision)
        }
    }
    const handleExceptionClick = () => {
        if (decisionMade?.exception) {
            setDecisionMade(null)
            const newQuestion = initialNotificationQuestions.find(question => question.id == decisionMade.exception)
            if (newQuestion) {
                setCurrentQuestion(newQuestion)
                setQuestionStack(prevStack => [...prevStack, newQuestion])
            }
        }
    }
    return (
        <>
            <div className="col-span-full">
                <Breadcrumb>
                    <BreadcrumbList className='text-xs'>
                        {questionStack.map((question: QuestionInterface, idx) => (
                            <BreadcrumbItem key={question.id}>
                                <BreadcrumbLink className='hover:cursor-pointer' onClick={() => handleBreadcrumbClick(idx)}>
                                    {question.breadcrumb}
                                </BreadcrumbLink>
                                <BreadcrumbSeparator />
                            </BreadcrumbItem>
                        ))}
                        {decisionMade && (
                            <BreadcrumbItem className='hover:cursor-pointer'>
                                UM Decision
                            </BreadcrumbItem>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="col-span-full my-8">
                <div className='flex w-full justify-center'>
                    <Tabs defaultValue="ccn" className="w-[600px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="ccn">CCN</TabsTrigger>
                            <TabsTrigger value="auth">Auth PS</TabsTrigger>
                        </TabsList>
                        <TabsContent value="ccn">
                            {decisionMade ? (
                                <Card>
                                    <CardHeader>
                                        {/* If Authorized Stable we want to use a particular color */}
                                        {decisionMade.action == "Authorized Stable" ? (
                                            <CardTitle className='flex flex-col items-center justify-center space-y-2 text-green-500'>
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
                                            // if CCN, we want our font to be yellow
                                        ) : (decisionMade.letter == "CCN") ? (
                                            <CardTitle className='flex flex-col items-center justify-center space-y-2 text-yellow-500'>
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
                                        ) : (
                                            <CardTitle className='flex flex-col items-center justify-center space-y-2 text-red-500'>
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
                                        )}
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
                                                <Button onClick={handleExceptionClick} variant={"outline"}>
                                                    <Speech />
                                                    Verbal Given After?
                                                </Button>
                                            </motion.div>
                                        )}

                                    </CardFooter>
                                </Card>
                            ) : (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className='flex items-center justify-center text-xl'>
                                            <motion.span
                                                key={currentQuestion.id}
                                                initial={{ scale: 0.5 }}
                                                animate={{ scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                transition={{ times: [0, 0.2, 1] }}
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
                                                <Button className='bg-blue-500 hover:bg-blue-300' onClick={(e) => handleQuestionClick(e, "no")}>
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
                                                <Button onClick={(e) => handleQuestionClick(e, "yes")} className='bg-green-500 hover:bg-green-800' variant={"default"}>
                                                    <Speech />
                                                    {currentQuestion.choices.yes}
                                                </Button>
                                            </motion.div>
                                        </CardContent>
                                    ) : (
                                        <CardContent className="flex justify-around items-center mt-12">
                                            {currentQuestion.question != "If Any Non-KFH Verbal Stability Given Subsequently" && (
                                                <motion.div
                                                    className="space-y-1"
                                                    whileHover={{
                                                        scale: 1.05,
                                                        transition: { duration: 0.2 },
                                                    }}
                                                    whileTap={{ scale: 0.8 }}
                                                >
                                                    <Button onClick={(e) => handleQuestionClick(e, "no")} variant={"destructive"}>
                                                        <X />
                                                        {currentQuestion.choices.no}
                                                    </Button>
                                                </motion.div>
                                            )}
                                            <motion.div
                                                className="space-y-1"
                                                whileHover={{
                                                    scale: 1.05,
                                                    transition: { duration: 0.2 },
                                                }}
                                                whileTap={{ scale: 0.8 }}
                                            >
                                                <Button onClick={(e) => handleQuestionClick(e, "yes")} className='bg-green-500 hover:bg-green-400' variant={"default"}>
                                                    <Check />
                                                    {currentQuestion.choices.yes}
                                                </Button>
                                            </motion.div>
                                        </CardContent>
                                    )}
                                    <CardFooter className='mt-12'>
                                    </CardFooter>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div >

        </>
    )
}

export default MainCard