import React from "react";
import { Check } from "lucide-react";

interface SubscriptionPlansProps {
  userSubscription: string;
  isBillingYearly: boolean;
  onIsBillingYearlyChange: (val: boolean) => void;
  onPlanSelect: (planKey: string, planName: string, amount: number, billing: string) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  userSubscription,
  isBillingYearly,
  onIsBillingYearlyChange,
  onPlanSelect,
}) => {
  const plans = [
    { key: "silver" as const, name: "Silver Package", price: isBillingYearly ? "₹24" : "₹30", duration: "Month", note: isBillingYearly ? "billed ₹288 annually" : "billed monthly", contacts: "50 Contacts", priority: "Standard matching", amountYearly: 288, amountMonthly: 30 },
    { key: "gold" as const, name: "Gold Package", price: isBillingYearly ? "₹36" : "₹45", duration: "Month", note: isBillingYearly ? "billed ₹432 annually" : "billed monthly", contacts: "120 Contacts", priority: "Higher matching ranking", popular: true, amountYearly: 432, amountMonthly: 45 },
    { key: "platinum" as const, name: "Platinum Package", price: isBillingYearly ? "₹48" : "₹60", duration: "Month", note: isBillingYearly ? "billed ₹576 annually" : "billed monthly", contacts: "Unlimited Contacts", priority: "Relationship manager support", amountYearly: 576, amountMonthly: 60 }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center max-w-sm mx-auto space-y-2">
        <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Matrimony Premium Plans</h3>
        <p className="text-[10px] text-slate-500 font-semibold">Choose a plan to contact matching profiles directly</p>

        <div className="flex items-center justify-center gap-3 mt-4">
          <span className={`text-[10px] font-bold ${!isBillingYearly ? "text-maroon-700 dark:text-gold-400" : "text-slate-500 dark:text-slate-450"}`}>Monthly</span>
          <button
            onClick={() => onIsBillingYearlyChange(!isBillingYearly)}
            className="relative w-10 h-5.5 bg-slate-200 dark:bg-dark-800 rounded-full transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle billing duration"
          >
            <div className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-maroon-700 dark:bg-gold-500 transition-transform duration-200 ${isBillingYearly ? "translate-x-4.5" : ""}`} />
          </button>
          <span className={`text-[10px] font-bold ${isBillingYearly ? "text-maroon-700 dark:text-gold-400" : "text-slate-500 dark:text-slate-450"}`}>
            Yearly <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold ml-1 bg-emerald-500/10 dark:bg-emerald-950/40 px-1 py-0.5 rounded-full">Save 20%</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className={`bg-white dark:bg-dark-900 border rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden shadow-sm ${plan.popular ? "border-maroon-700 ring-2 ring-maroon-700/10" : "border-slate-100 dark:border-dark-850"}`}>
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-maroon-700 text-white text-[9px] font-bold px-3 py-1 rounded-bl-lg uppercase">Popular</div>
            )}
            {userSubscription === plan.key && (
              <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[9px] font-bold px-3 py-1 rounded-br-lg uppercase">Active</div>
            )}
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-white">{plan.name}</h4>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{plan.price} <span className="text-[10px] font-normal text-slate-400">/ {plan.duration}</span></h3>
                {plan.note && <p className="text-[9px] text-slate-400 mt-0.5 font-semibold italic">{plan.note}</p>}
              </div>
              <ul className="space-y-2 text-[10px] text-slate-655 dark:text-slate-350 border-t pt-3 font-semibold">
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> {plan.contacts}</li>
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> {plan.priority}</li>
              </ul>
            </div>
            <button
              onClick={() => onPlanSelect(plan.key, plan.name, isBillingYearly ? plan.amountYearly : plan.amountMonthly, isBillingYearly ? "Yearly" : "Monthly")}
              disabled={userSubscription === plan.key}
              className={`w-full py-2.5 mt-6 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${userSubscription === plan.key
                ? "bg-emerald-500 text-white"
                : "bg-slate-50 hover:bg-maroon-50 text-slate-800 hover:text-maroon-750 dark:bg-dark-950 dark:hover:bg-dark-850 border border-slate-100 dark:border-dark-850"
                }`}
            >
              {userSubscription === plan.key ? "Active Plan" : "Select Plan"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
