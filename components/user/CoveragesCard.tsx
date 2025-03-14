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
import { Ban, Check, CircleAlert, Cross, DollarSign, Hospital, InfoIcon, LetterText, MailCheckIcon, Newspaper, Receipt, RotateCcw, ShieldAlert, Speech, X } from 'lucide-react'
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
        question: "Notification: Verbal or Fax?",
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
            exception: null
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
            reason: "Provider Non-Authorized - Failure To Cooperate With Transfer",
            letter: "FTCWT",
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
interface CoverageInterface {
    id: number,
    title: string,
    name: string,
    reviewOutcome: string[],
    paymentNotes: string[],
    repat: string[],
    rtr: string[],
    exception: string[]
}
const coverages = [
    {
        id: 0,
        title: "kpsecondary",
        name: "KP Secondary",
        reviewOutcome: ["Normal management and RO pathway until KP Secondary confirmed."],
        paymentNotes: ["Document in PN as soon as confirmed."],
        repat: ["Yes"],
        rtr: ["Yes if offered repat."],
        exception: ["Authorize, PAD, and don't offer repat if KP MD/Leaders instruct to leave at NKF."]
    },
    {
        id: 1,
        title: "ccs",
        name: "CCS",
        reviewOutcome: ["Normal management and RO pathway until SAR confirmed.",
            "Once SAR confirmed for KP MD/leadership instructs to lae at NKF: Render UPSC once, no letter, no further RO required and PAD."
        ],
        paymentNotes: ["Document in PN as soon as SAR# or when KP MD/leadership instruct at leave at NKF."],
        repat: [
            "Yes, if pending SAR",
            "Do not offer repat after SAR confirmed and documented."
        ],
        rtr: ["Yes if offered repat."],
        exception: ["No need to call NKF with UPSC scripting."]
    },
    {
        id: 2,
        title: "workersComp",
        name: "Workers Comp",
        reviewOutcome: [
            "Normal management and RO pathway until WC confirmed.",
            "Once WC confirmed: Render UPSC once, no letter, no further RO required and PAD."
        ],
        paymentNotes: ["Document in PN as soon as confirmed including company name, WC CM/Adjuster contacts, and case/authorization number."],
        repat: [
            "Yes, if pending pending official case #.",
            "Do not offer repat after WC confirmed and documented."
        ],
        rtr: ["Yes if offered repat."],
        exception: ["No need to call NKF with UPSC scripting."]
    },
    {
        id: 3,
        title: "clinicalTrial",
        name: "Medicare Clinical Trial & Commercial Clinical Trial without Referrals",
        reviewOutcome: [
            "Reach out to MC for referrals if indicated.",
            "Clinical trial cases with or without referrals in HC: Render UPSC once, no letter, no further RO required and PAD."
        ],
        paymentNotes: ["Document in PN and include referral numbers if available."],
        repat: ["No"],
        rtr: ["N/A"],
        exception: ["Commercial: Clinical Trial with referrals - Handoff to Referral Desk", "No need to call NKF with UPSC scripting."]
    },
    {
        id: 4,
        title: "bariatricSurgery",
        name: "Bariatric Surgery Readmission",
        reviewOutcome: [
            "If readmitted within 90 days (Global Surgical Payment): Render UPSC once, no letter, no further RO required and PAD.",
            "If readmitted > 90 days (beyond Global Surgical Payment): normal management and RO."
        ],
        paymentNotes: [
            "If readmitted with 90 days (Global Surgical Payment): Document in PN including original surgical date",
            "If readmitted > 90 days (beyond Global Surgical Payment): N/A"
        ],
        repat: [
            "If readmitted with 90 days (Global Surgical Payment): No",
            "If readmitted > 90 days (beyond Global Surgical Payment): Yes"
        ],
        rtr: [
            "If readmitted with 90 days (Global Surgical Payment): N/A",
            "If readmitted > 90 days (beyond Global Surgical Payment): Yes if offered repat"
        ],
        exception: [
            "If readmitted with 90 days (Global Surgical Payment): N/A",
            "If readmitted > 90 days (beyond Global Surgical Payment): No need to call NKF with UPSC scripting."
        ]
    },
    {
        id: 5,
        title: "jailCustody",
        name: "Jail/Custody",
        reviewOutcome: [
            "Normal management and RO pathway.",
            "Once stable with verbal/written order t transfer but unable to transfer back to county: Render UPSC once, no letter no further Ro required and PAD."
        ],
        paymentNotes: ["Document in PN if ready for transfer with verbal/written order but county does not accept patient back."],
        repat: ["Yes"],
        rtr: ["N/A"],
        exception: ["No need to call NKF with UPSC scripting."]
    },
]
//  ** For all decisions, no will be represented by 0 and yes will equal 1.
const CoveragesCard = () => {
    const [questionStack, setQuestionStack] = useState<QuestionInterface[]>([ccnQuestions[0]])
    const [currentQuestion, setCurrentQuestion] = useState(ccnQuestions[0])
    const [activeTab, setActiveTab] = useState<string>("secondary")
    const [decisionMade, setDecisionMade] = useState<UMDecisionInterface | null>(null)
    const [currentCategory, setCurrentCategory] = useState<CoverageInterface>(coverages[0])
    const [dialogText, setDialogText] = useState<string[]>([""])
    const spanMotionAnimation = {
        initial: { scale: 0.5 },
        animate: { scale: 1 },
        exit: { opacity: 0, scale: 0.5 },
        transition: { times: [0, 0.2, 1] }
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
    const handleButtonClick = (value: string) => {
        if (value == "reviewOutcome") {
            setDialogText(currentCategory.reviewOutcome)
        } else if (value == "paymentNotes") {
            setDialogText(currentCategory.paymentNotes)
        } else if (value == "repat") {
            setDialogText(currentCategory.repat)
        }
        else if (value == "rtr") {
            setDialogText(currentCategory.rtr)
        }
        else if (value == "exception") {
            setDialogText(currentCategory.exception)
        }
    }
    const handleTabChange = (value: string) => {
        setActiveTab(value)
        if (value == "secondary") {
            setCurrentCategory(coverages[0])
            setQuestionStack([ccnQuestions[0]])
            setCurrentQuestion(ccnQuestions[0])
        } else if (value == 'ccs') {
            setCurrentCategory(coverages[1])
            setQuestionStack([authQuestions[0]])
            setCurrentQuestion(authQuestions[0])
        } else if (value == "workersComp") {
            setCurrentCategory(coverages[2])
            setQuestionStack([upscQuestions[0]])
            setCurrentQuestion(upscQuestions[0])
        } else if (value == "clinTrial") {
            setCurrentCategory(coverages[3])
            setQuestionStack([fcnaQuestions[0]])
            setCurrentQuestion(fcnaQuestions[0])
        }
        else if (value == "bariSurg") {
            setCurrentCategory(coverages[4])
            setQuestionStack([fcnaQuestions[0]])
            setCurrentQuestion(fcnaQuestions[0])
        }
        else if (value == "jail") {
            setCurrentCategory(coverages[5])
            setQuestionStack([fcnaQuestions[0]])
            setCurrentQuestion(fcnaQuestions[0])
        }
    }
    const listItems = ["secondary", "ccs", "workersComp", "clinTrial", "bariSurg", "jail"]
    return (
        <>
            <div className="container mx-auto px-10 py-4">
                <form className="grid w-full items-start gap-6">
                    <fieldset className="grid gap-6 rounded-lg border p-4">
                        <legend className="-ml-1 px-1 text-sm font-bold">Select Tab for Other Coverage</legend>
                        <div className="col-span-full">

                        </div>
                        <div className="col-span-full my-4">
                            <div className='flex w-full justify-center'>
                                <Tabs value={activeTab} defaultValue="secondary" onValueChange={handleTabChange} className="w-[900px]">
                                    <TabsList className="grid w-full grid-cols-6">
                                        <TabsTrigger value="secondary">KP Secondary</TabsTrigger>
                                        <TabsTrigger value="ccs">CCS</TabsTrigger>
                                        <TabsTrigger value="workersComp">Worker Comp</TabsTrigger>
                                        <TabsTrigger value="clinTrial">Clinical trial</TabsTrigger>
                                        <TabsTrigger value="bariSurg">Bari Surgery Re-Admit</TabsTrigger>
                                        <TabsTrigger value="jail">Jail/Custody</TabsTrigger>
                                    </TabsList>
                                    {listItems.map((item) => (
                                        <TabsContent key={item} value={item}>
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className='flex items-center justify-center text-xl'>
                                                        <motion.span
                                                            key={currentCategory.id}
                                                            {...spanMotionAnimation}
                                                        >
                                                            {currentCategory.name}
                                                        </motion.span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="grid grid-cols-2 mt-2 gap-4">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button className='bg-green-500 hover:bg-green-400' onClick={() => handleButtonClick("reviewOutcome")}>
                                                                Review Outcome
                                                                <Newspaper />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogTitle>Review Outcome</DialogTitle>
                                                            <DialogHeader>
                                                                <DialogDescription asChild>
                                                                    <ol>
                                                                        {dialogText.map((text) => (
                                                                            <li className='my-8' key={text}>
                                                                                {text}
                                                                            </li>
                                                                        ))}
                                                                    </ol>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button className='bg-blue-500 hover:bg-blue-400' onClick={() => handleButtonClick("paymentNotes")}>
                                                                Payment Notes
                                                                <Receipt />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogTitle>Payment Notes</DialogTitle>
                                                            <DialogHeader>
                                                                <DialogDescription asChild>
                                                                    <ol>
                                                                        {dialogText.map((text) => (
                                                                            <li className='my-8' key={text}>
                                                                                {text}
                                                                            </li>
                                                                        ))}
                                                                    </ol>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button className='bg-orange-500 hover:bg-orange-400' onClick={() => handleButtonClick("repat")}>
                                                                Offer Repat or UPSC If Stable
                                                                <Hospital />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogTitle>Offer Repat or UPSC If Stable</DialogTitle>
                                                            <DialogHeader>
                                                                <DialogDescription asChild>
                                                                    <ol>
                                                                        {dialogText.map((text) => (
                                                                            <li className='my-8' key={text}>
                                                                                {text}
                                                                            </li>
                                                                        ))}
                                                                    </ol>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button className='bg-purple-500 hover:bg-purple-400' onClick={() => handleButtonClick("rtr")}>
                                                                Issue RTR If Refused
                                                                <Ban />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogTitle>Issue RTR If Refused</DialogTitle>
                                                            <DialogHeader>
                                                                <DialogDescription asChild>
                                                                    <ol>
                                                                        {dialogText.map((text) => (
                                                                            <li className='my-8' key={text}>
                                                                                {text}
                                                                            </li>
                                                                        ))}
                                                                    </ol>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button className='bg-yellow-500 hover:bg-yellow-400' onClick={() => handleButtonClick("exception")}>
                                                                Exception
                                                                <ShieldAlert />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogTitle>Exception</DialogTitle>
                                                            <DialogHeader>
                                                                <DialogDescription asChild>
                                                                    <ol>
                                                                        {dialogText.map((text) => (
                                                                            <li className='my-8' key={text}>
                                                                                {text}
                                                                            </li>
                                                                        ))}
                                                                    </ol>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                        </DialogContent>
                                                    </Dialog>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                    ))}

                                </Tabs>
                            </div>
                        </div >
                    </fieldset>
                </form>
            </div>
        </>
    )
}

export default CoveragesCard