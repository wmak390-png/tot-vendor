import { useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  FilePenLine,
  Headphones,
  Mail,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";

type ActionState = "idle" | "documents" | "appeal" | "support";

const steps = [
  { label: "Business details", state: "complete" },
  { label: "Identity documents", state: "complete" },
  { label: "Review", state: "current" },
] as const;

export function Verification() {
  const [activeAction, setActiveAction] = useState<ActionState>("idle");
  const [appealSent, setAppealSent] = useState(false);

  const closeAction = () => {
    setActiveAction("idle");
    setAppealSent(false);
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#f8f4ee] px-4 py-5 text-[#292827] [font-family:'DM_Sans',sans-serif] sm:px-6 sm:py-8">
      <div className="relative mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-[414px] flex-col overflow-hidden rounded-[30px] bg-[#fffdf9] shadow-[0_22px_70px_rgba(71,48,28,0.14)] ring-1 ring-[#eadfd2] sm:min-h-[780px]">
        <header className="flex items-center justify-between border-b border-[#eee5db] px-6 py-5">
          <button
            type="button"
            onClick={() => setActiveAction("idle")}
            aria-label="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e7ddd2] text-[#55504a] transition-transform hover:-translate-x-0.5 hover:bg-[#fbf2e9] focus:outline-none focus:ring-2 focus:ring-[#eb6b2d]/35"
          >
            <ArrowLeft className="h-[17px] w-[17px]" strokeWidth={2.1} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f26b31] text-white shadow-[0_5px_12px_rgba(242,107,49,0.22)]">
              <span className="text-[17px] font-black leading-none">T</span>
            </div>
            <span className="text-[15px] font-extrabold tracking-[-0.02em] text-[#292827]">
              TakeOnTime
            </span>
          </div>
          <span className="w-9" aria-hidden="true" />
        </header>

        <div className="flex-1 overflow-y-auto">
          <section className="px-6 pb-7 pt-7">
            <div className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#a19a91]">
              <span>Vendor onboarding</span>
              <span className="h-1 w-1 rounded-full bg-[#f26b31]" />
              <span>Step 3 of 3</span>
            </div>

            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-[#fff0e7] text-[#e45d25]">
                <Clock3 className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-[27px] font-black leading-[1.08] tracking-[-0.045em] text-[#292827]">
                  Your account is
                  <br />
                  under review
                </h1>
                <p className="mt-2 text-[13px] leading-5 text-[#777069]">
                  A quick check before your business goes live.
                </p>
              </div>
            </div>

            <div className="rounded-[18px] border border-[#f2c8ab] bg-[#fff4eb] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f26b31] text-white">
                  <ShieldCheck className="h-4 w-4" strokeWidth={2.4} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#88401f]">Review in progress</p>
                  <p className="mt-1 text-[12px] leading-[1.45] text-[#986047]">
                    We received your documents on 14 June. Most reviews are finished within
                    1–2 working days.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-[#eee5db] bg-[#fcfaf6] px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#68615b]">
                Verification journey
              </h2>
              <span className="rounded-full bg-[#e9f3eb] px-2.5 py-1 text-[10px] font-extrabold text-[#3d7750]">
                2 complete
              </span>
            </div>
            <div className="relative flex justify-between">
              <div className="absolute left-[14px] right-[14px] top-[14px] h-px bg-[#ded7cf]" />
              <div className="absolute left-[14px] top-[14px] h-px w-[49%] bg-[#4d9b61]" />
              {steps.map((step) => (
                <div key={step.label} className="relative z-10 flex w-[31%] flex-col gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-[3px] ${
                      step.state === "complete"
                        ? "border-[#4d9b61] bg-[#4d9b61] text-white"
                        : "border-[#f26b31] bg-[#fffdf9] text-[#f26b31]"
                    }`}
                  >
                    {step.state === "complete" ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-[#f26b31]" />
                    )}
                  </div>
                  <span className="max-w-[82px] text-[10px] font-semibold leading-[1.35] text-[#777069]">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="px-6 pb-6 pt-6">
            <div className="rounded-[20px] border border-[#e8ded3] bg-[#fffdf9] p-5 shadow-[0_8px_24px_rgba(71,48,28,0.05)]">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f5eee7] text-[#716960]">
                  <FilePenLine className="h-[17px] w-[17px]" strokeWidth={2} />
                </div>
                <h2 className="text-[15px] font-extrabold tracking-[-0.02em] text-[#302e2b]">
                  What happens next?
                </h2>
              </div>
              <p className="text-[12px] leading-[1.6] text-[#716b64]">
                Our team is checking that your business details match your documents. If we
                need anything else, we&apos;ll let you know here and by email.
              </p>
              <div className="mt-4 flex items-center gap-2 border-t border-[#eee6dd] pt-4 text-[11px] font-semibold text-[#817970]">
                <RotateCcw className="h-3.5 w-3.5 text-[#f26b31]" />
                Last updated today at 10:42
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#8f877e]">
                Need to make a change?
              </p>
              <button
                type="button"
                onClick={() => setActiveAction("documents")}
                className="group flex w-full items-center justify-between rounded-[15px] border border-[#e7ddd2] bg-[#fffdf9] px-4 py-3.5 text-left transition-colors hover:border-[#f2b08a] hover:bg-[#fff8f2] focus:outline-none focus:ring-2 focus:ring-[#eb6b2d]/35"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff0e7] text-[#e45d25]">
                    <FilePenLine className="h-4 w-4" strokeWidth={2.1} />
                  </span>
                  <span>
                    <span className="block text-[13px] font-bold text-[#38332f]">Update documents</span>
                    <span className="mt-0.5 block text-[11px] text-[#8b837b]">Replace a file or add a clearer copy</span>
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-[#b8aea4] transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveAction("appeal")}
                className="group mt-2.5 flex w-full items-center justify-between rounded-[15px] border border-[#e7ddd2] bg-[#fffdf9] px-4 py-3.5 text-left transition-colors hover:border-[#f2b08a] hover:bg-[#fff8f2] focus:outline-none focus:ring-2 focus:ring-[#eb6b2d]/35"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5eee7] text-[#6e655d]">
                    <Mail className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <span>
                    <span className="block text-[13px] font-bold text-[#38332f]">Appeal a decision</span>
                    <span className="mt-0.5 block text-[11px] text-[#8b837b]">Tell us if something doesn&apos;t look right</span>
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-[#b8aea4] transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </section>

          <section className="mx-6 mb-6 rounded-[18px] bg-[#2f302f] px-5 py-4 text-[#fffaf4]">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#484846] text-[#ffb181]">
                <Headphones className="h-4 w-4" strokeWidth={2.1} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold">Questions? We&apos;re here.</p>
                <p className="mt-1 text-[11px] leading-[1.45] text-[#c7c1b8]">
                  Talk to a real person from the TakeOnTime team.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveAction("support")}
                  className="mt-3 text-[11px] font-extrabold text-[#ffb181] underline decoration-[#ffb181]/40 underline-offset-4 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#ffb181]/50"
                >
                  Contact support
                </button>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 text-[#9a948b]" />
            </div>
          </section>
        </div>

        <footer className="border-t border-[#eee5db] px-6 py-4">
          <div className="flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => setActiveAction("idle")}
              className="font-bold text-[#777069] underline decoration-[#c8bdb1] underline-offset-4 hover:text-[#f26b31] focus:outline-none focus:ring-2 focus:ring-[#eb6b2d]/35"
            >
              Return to login
            </button>
            <button
              type="button"
              onClick={() => setActiveAction("idle")}
              className="flex items-center gap-1 font-bold text-[#f26b31] hover:text-[#c7531f] focus:outline-none focus:ring-2 focus:ring-[#eb6b2d]/35"
            >
              App preview <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </footer>

        {activeAction !== "idle" && (
          <div className="fixed inset-0 z-20 flex items-end justify-center bg-[#2b211b]/30 p-4 sm:absolute sm:inset-auto sm:bottom-4 sm:left-4 sm:right-4 sm:p-0">
            <div className="w-full max-w-[382px] rounded-[22px] border border-[#eaded3] bg-[#fffdf9] p-5 shadow-[0_20px_55px_rgba(51,35,23,0.2)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#f26b31]">
                    {activeAction === "documents"
                      ? "Document update"
                      : activeAction === "appeal"
                        ? "Appeal request"
                        : "Support"}
                  </p>
                  <h2 className="mt-1 text-[20px] font-black tracking-[-0.035em] text-[#302e2b]">
                    {activeAction === "documents"
                      ? "We can help you fix that."
                      : activeAction === "appeal"
                        ? "We'll review it with you."
                        : "A little help is close by."}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeAction}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f6efe8] text-[#736a61] hover:bg-[#f1e5da] focus:outline-none focus:ring-2 focus:ring-[#eb6b2d]/35"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-[12px] leading-[1.55] text-[#756e67]">
                {activeAction === "documents"
                  ? "Your current review will stay open. Add a new document and our team will use the clearest version."
                  : activeAction === "appeal"
                    ? appealSent
                      ? "Your appeal is queued for the review team. We'll email you when there is an update."
                      : "Share a little context and we'll make sure it reaches the right person."
                    : "Our support team is available Monday to Friday, 9:00–18:00. Average reply time is under one working day."}
              </p>
              {activeAction === "appeal" && !appealSent && (
                <textarea
                  aria-label="Appeal details"
                  placeholder="What would you like us to take another look at?"
                  className="mt-4 min-h-[84px] w-full resize-none rounded-[13px] border border-[#e5dacf] bg-[#fcfaf7] px-3 py-2.5 text-[12px] text-[#39342f] outline-none placeholder:text-[#aaa097] focus:border-[#f19a68] focus:ring-2 focus:ring-[#f5c4a5]/40"
                />
              )}
              <div className="mt-4 flex gap-2.5">
                <button
                  type="button"
                  onClick={closeAction}
                  className="flex-1 rounded-[12px] border border-[#dfd4ca] px-3 py-2.5 text-[12px] font-bold text-[#6c645c] hover:bg-[#fbf5ef] focus:outline-none focus:ring-2 focus:ring-[#eb6b2d]/35"
                >
                  Not now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (activeAction === "appeal") setAppealSent(true);
                    else closeAction();
                  }}
                  className="flex-1 rounded-[12px] bg-[#f26b31] px-3 py-2.5 text-[12px] font-extrabold text-white shadow-[0_7px_14px_rgba(242,107,49,0.2)] hover:bg-[#de5c27] focus:outline-none focus:ring-2 focus:ring-[#eb6b2d]/40"
                >
                  {activeAction === "documents"
                    ? "Continue"
                    : activeAction === "appeal"
                      ? appealSent
                        ? "Done"
                        : "Send appeal"
                      : "Open support"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}