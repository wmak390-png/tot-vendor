import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Heart,
  HelpCircle,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  Star,
  ThumbsUp,
  Utensils,
  X,
} from "lucide-react";
import { takeOnTimeStore } from "@/lib/takeontime-store";

export function OrderFeedback({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [tasteRating, setTasteRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [packagingRating, setPackagingRating] = useState(5);

  const [selectedTags, setSelectedTags] = useState<string[]>(["Piping Hot", "Zero Wait Time"]);
  const [comment, setComment] = useState("");
  const [selectedTip, setSelectedTip] = useState<number | null>(20);
  const [submitted, setSubmitted] = useState(false);

  // Issue Resolution State
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<string>("Missing item (e.g., Beverage or Chutney)");
  const [refundClaimed, setRefundClaimed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const order = takeOnTimeStore.getOrderById("TOT-4814") || {
    id: "TOT-4814",
    vendorName: "Little Fern Kitchen",
    amount: "₹280",
    items: [
      { name: "Paneer Tikka Rice Bowl", quantity: 1 },
      { name: "Ginger Lemon Cooler", quantity: 1 },
    ],
  };

  const complimentTags = [
    "Piping Hot",
    "Super Crispy",
    "Zero Wait Time",
    "Eco-Friendly Pack",
    "Generous Chutney",
    "Authentic Taste",
    "Courteous Staff",
  ];

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    notify("Thank you! Your feedback has been shared with Little Fern Kitchen.");
  };

  const handleClaimRefund = () => {
    setRefundClaimed(true);
    notify("Instant refund of ₹50 initiated to UPI ID maya.rodriguez@okaxis via Razorpay Payouts.");
  };

  return (
    <main className="min-h-screen w-full bg-[#f8faf8] text-[#1c241e] font-sans pb-20">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#121c14] px-4 py-2.5 text-xs font-semibold text-[#8bf2a9] shadow-2xl flex items-center gap-2 border border-[#2b3a2f]">
          <CheckCircle2 className="h-4 w-4 text-[#4ed976]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#19241b] text-white px-4 py-6 sm:px-8 border-b border-[#293d2c]">
        <div className="mx-auto max-w-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#f09562]">
                TakeOnTime
              </span>
              <span className="text-xs text-[#8a9e8f]">· Food Quality & Experience</span>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("customer-flow/CustomerOrders")}
                className="text-xs font-bold text-[#8bf2a9] hover:underline"
              >
                Back to Orders
              </button>
            )}
          </div>

          <h1 className="text-xl font-bold text-white">How was your meal from Little Fern?</h1>
          <p className="text-xs text-[#9fb8a4] mt-0.5">Order #{order.id} · Embassy TechVillage Counter Bay 02</p>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-4 py-5 space-y-4">
        {!submitted ? (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* 3 Rating Dimensions */}
            <section aria-label="Rating Dimensions" className="rounded-2xl bg-white p-5 shadow-sm border border-[#e2e8e2] space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-[#1c241e]">Food Taste & Freshness</span>
                  <span className="text-xs font-bold text-[#ed6c2d]">{tasteRating} / 5 Stars</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setTasteRating(star)}
                      className="p-2 text-2xl hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= tasteRating ? "text-[#f59e0b] fill-[#f59e0b]" : "text-[#d1d5db]"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#f0f4f0] pt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-[#1c241e]">On-Time Prep Accuracy</span>
                  <span className="text-xs font-bold text-[#ed6c2d]">{punctualityRating} / 5 Stars</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setPunctualityRating(star)}
                      className="p-2 text-2xl hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= punctualityRating ? "text-[#f59e0b] fill-[#f59e0b]" : "text-[#d1d5db]"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#f0f4f0] pt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-[#1c241e]">Packaging & Spill-Free Seal</span>
                  <span className="text-xs font-bold text-[#ed6c2d]">{packagingRating} / 5 Stars</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setPackagingRating(star)}
                      className="p-2 text-2xl hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= packagingRating ? "text-[#f59e0b] fill-[#f59e0b]" : "text-[#d1d5db]"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Compliments Chips */}
            <section aria-label="Compliment Chips" className="rounded-2xl bg-white p-4 shadow-sm border border-[#e2e8e2]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#617466] mb-3 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#ed6c2d]" /> What stood out?
              </h2>
              <div className="flex flex-wrap gap-2">
                {complimentTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border cursor-pointer ${
                      selectedTags.includes(tag)
                        ? "bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]"
                        : "bg-[#f8faf8] text-[#55695a] border-[#dce4dc] hover:bg-[#eff3ef]"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            {/* Written Note */}
            <section aria-label="Detailed Feedback" className="rounded-2xl bg-white p-4 shadow-sm border border-[#e2e8e2]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#617466] mb-2">
                Notes for the Chef (Optional)
              </h2>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="The chutney was wonderfully authentic! Degree coffee was piping hot..."
                className="w-full bg-[#f8faf8] border border-[#dce4dc] rounded-xl p-3 text-xs text-[#1c241e] focus:outline-none focus:border-[#ed6c2d]"
              />
            </section>

            {/* Tip the Kitchen Staff */}
            <section aria-label="Tip Kitchen" className="rounded-2xl bg-white p-4 shadow-sm border border-[#e2e8e2]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-[#1c241e] flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-[#e11d48]" /> Tip Counter Staff & Kitchen Cooks
                </span>
                <span className="text-[11px] text-[#617466]">100% goes to staff</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 30, null].map((tipVal, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedTip(tipVal)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      selectedTip === tipVal
                        ? "bg-[#ed6c2d] text-white border-[#ed6c2d]"
                        : "bg-[#f8faf8] text-[#1c241e] border-[#dce4dc] hover:bg-[#eff3ef]"
                    }`}
                  >
                    {tipVal !== null ? `₹${tipVal}` : "No Tip"}
                  </button>
                ))}
              </div>
            </section>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs bg-[#ed6c2d] hover:bg-[#d95d20] text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" /> Submit Feedback & Tip
            </button>
          </form>
        ) : (
          <section aria-label="Feedback Complete" className="rounded-2xl bg-white p-6 shadow-sm border border-[#e2e8e2] text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-center text-[#15803d] mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold text-[#1c241e]">Thank you for your rating!</h2>
            <p className="text-xs text-[#617466] max-w-sm mx-auto">
              Your feedback helps Little Fern Kitchen maintain their 4.8★ canteen rating. {selectedTip ? `Your tip of ₹${selectedTip} was disbursed to the cooking staff.` : ""}
            </p>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("customer-flow/Discovery")}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#1c281e] text-white hover:bg-[#28382c] transition-colors"
              >
                Order More Food
              </button>
            )}
          </section>
        )}

        {/* Issue Resolution Drawer Button */}
        <section aria-label="Issue Resolution Card" className="rounded-2xl bg-[#fff7ed] border border-[#fed7aa] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-[#ea580c]" />
            <div>
              <h3 className="text-xs font-bold text-[#9a3412]">Issue with this order?</h3>
              <p className="text-[11px] text-[#c2410c]">Missing item, delayed pickup, or food spillage</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowIssueModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#ea580c] hover:bg-[#c2410c] text-white transition-colors cursor-pointer"
          >
            Get Help
          </button>
        </section>

        {/* Issue Resolution Modal */}
        {showIssueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-[#1c241e]">
              <div className="flex items-center justify-between border-b border-[#e5ebe5] pb-3 mb-4">
                <h3 className="font-bold text-sm text-[#1c241e]">Automated Order Issue Resolution</h3>
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="p-1 text-[#617466] hover:bg-[#f1f5f1] rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {!refundClaimed ? (
                <div className="space-y-3 text-xs mb-5">
                  <p className="text-[#617466]">Select the problem encountered at Counter Bay 02:</p>
                  {[
                    "Missing item (e.g., Beverage or Chutney)",
                    "Food was cold upon pickup",
                    "Pickup delay exceeded promised window",
                    "Spillage inside container",
                  ].map((issue) => (
                    <label
                      key={issue}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedIssue === issue
                          ? "bg-[#fff7ed] border-[#ea580c] text-[#9a3412] font-semibold"
                          : "bg-[#f8faf8] border-[#e2e8e2] text-[#374151]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="issue"
                        checked={selectedIssue === issue}
                        onChange={() => setSelectedIssue(issue)}
                        className="accent-[#ea580c]"
                      />
                      <span>{issue}</span>
                    </label>
                  ))}

                  <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-3 rounded-xl text-xs text-[#166534]">
                    <strong>Instant Auto-Resolution Guarantee:</strong>
                    <p className="text-[11px] mt-0.5">
                      For missing beverage/extras, an immediate ₹50 refund will be credited back to your UPI account without asking questions.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] text-center space-y-2 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-[#15803d] mx-auto" />
                  <h4 className="font-bold text-sm text-[#15803d]">Refund Credited Successfully!</h4>
                  <p className="text-xs text-[#166534]">
                    ₹50 has been sent to UPI ID <strong>maya.rodriguez@okaxis</strong>. Razorpay RRN: #TOTREF981428.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {!refundClaimed ? (
                  <button
                    type="button"
                    onClick={handleClaimRefund}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#ea580c] hover:bg-[#c2410c] text-white cursor-pointer shadow-md"
                  >
                    Process Instant ₹50 Refund
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowIssueModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#1c281e] text-white"
                  >
                    Done
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#f1f5f1] text-[#617466]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default OrderFeedback;
