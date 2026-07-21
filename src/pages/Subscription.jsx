import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { Check, CreditCard, Clock, Calendar, AlertTriangle, Upload, ChevronRight } from 'lucide-react'

const AVAILABLE_PLANS = [
  {
    name: 'Starter',
    price: 'NPR 99',
    period: 'month',
    tournamentLimit: 10,
    color: 'border-blue-500/30 bg-blue-500/5',
    features: [
      'Up to 10 Tournaments / month',
      'Automated match generation',
      'Participant registration forms',
      'Basic analytics dashboard',
      'Registration CSV export',
      'Priority Discord support',
    ]
  },
  {
    name: 'Pro',
    price: 'NPR 299',
    period: 'month',
    tournamentLimit: Infinity,
    color: 'border-indigo-500/30 bg-indigo-500/5',
    features: [
      'Unlimited Tournaments',
      'AI tournament controls',
      'Auto match scheduling',
      'AI announcements & posters',
      'Advanced analytics dashboard',
      'Daily Excel reports via DM',
      'Custom role branding',
    ]
  },
  {
    name: 'Elite',
    price: 'NPR 399',
    period: 'month',
    tournamentLimit: Infinity,
    color: 'border-amber-500/30 bg-amber-500/5',
    features: [
      'Everything in Pro',
      'AI support agent in Discord',
      'Auto meme & clip posts',
      'Server growth AI advisor',
      '/host_game engagement tools',
      'Custom server branding',
      'Dedicated account manager',
    ]
  }
]

export default function Subscription() {
  const { guild, token } = useAuth()
  const [server, setServer] = useState(null)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Payment Form State
  const [selectedPlan, setSelectedPlan] = useState(AVAILABLE_PLANS[0])
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [transactionId, setTransactionId] = useState('')
  const [screenshotBase64, setScreenshotBase64] = useState('')
  const [fileName, setFileName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [submitError, setSubmitError] = useState('')

  const loadData = () => {
    if (!guild || !token) return
    setLoading(true)
    setError('')
    Promise.all([
      api.getServer(guild.id, token),
      api.getPaymentMethods(),
      api.getMyTransactions(guild.id, token)
    ])
      .then(([serverResponse, paymentResponse, transactionsResponse]) => {
        setServer(serverResponse?.server || serverResponse)
        const methods = paymentResponse?.methods || paymentResponse?.payment_methods || []
        setPaymentMethods(methods)
        setTransactions(transactionsResponse?.transactions || transactionsResponse || [])
        if (methods.length > 0) {
          const activeMethod = methods.find(m => m.active) || methods[0]
          setSelectedMethod(activeMethod)
        }
      })
      .catch((err) => {
        console.error(err)
        setError(err.message || 'Failed to load subscription details.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [guild, token])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onloadend = () => {
      setScreenshotBase64(reader.result)
    }
    reader.onerror = () => {
      setSubmitError('Failed to read file. Please try another image.')
    }
    reader.readAsDataURL(file)
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPlan || !selectedMethod) return
    if (!transactionId.trim()) {
      setSubmitError('Please enter a Transaction ID.')
      return
    }
    if (!screenshotBase64) {
      setSubmitError('Please upload a screenshot of your payment.')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')

    try {
      const amountValue = selectedPlan.name === 'Starter' ? 99 : selectedPlan.name === 'Pro' ? 299 : selectedPlan.name === 'Elite' ? 399 : 0
      const payload = {
        guild_id: guild.id,
        guild_name: guild.name,
        plan_name: selectedPlan.name,
        amount: amountValue,
        transaction_id: transactionId,
        payment_method_name: selectedMethod.name,
        screenshot_base64: screenshotBase64,
      }

      await api.submitPayment(payload, token)
      setSubmitSuccess('🎉 Payment details submitted successfully! Our team will verify and activate your plan shortly.')
      setTransactionId('')
      setScreenshotBase64('')
      setFileName('')

      // Reload transactions list
      const txs = await api.getMyTransactions(guild.id, token)
      setTransactions(txs?.transactions || txs || [])
    } catch (err) {
      console.error(err)
      setSubmitError(err.message || 'An error occurred while submitting payment. Please verify inputs.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-2" />
        <p className="text-red-300 font-medium">{error}</p>
        <button
          onClick={loadData}
          className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  const currentPlan = server?.plan_name || 'Free Trial'
  const currentStatus = server?.subscription_status || 'trial'
  const used = server?.tournaments_used || 0
  const limit = server?.tournament_limit || 3
  const usagePercentage = limit === Infinity ? 0 : Math.min(100, (used / limit) * 100)

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Subscription & Billing</h1>
        <p className="text-gray-400 text-sm mt-0.5">Upgrade your server plan, set up payment details, and view transactions history.</p>
      </div>

      {/* Current Plan Overview */}
      <div className="bg-[#13131a] border border-white/5 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">CURRENT PLAN</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              currentStatus === 'trial' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {currentStatus.toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{currentPlan}</h2>
            <p className="text-gray-500 text-sm mt-1">
              Active on guild: <span className="text-gray-300 font-medium font-mono">{guild?.name}</span>
            </p>
          </div>
        </div>

        {/* Progress Usage bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-medium">Tournament Usage</span>
            <span className="text-white font-semibold font-mono">
              {used} / {limit === Infinity ? '∞' : limit}
            </span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${limit === Infinity ? 0 : usagePercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {limit === Infinity ? 'Unlimited tournament creation' : `${limit - used} slots remaining before limit is hit`}
          </p>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold text-lg">Available Premium Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AVAILABLE_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`border rounded-xl p-5 flex flex-col justify-between space-y-6 transition-all ${
                plan.color
              } ${selectedPlan.name === plan.name ? 'ring-2 ring-indigo-500 border-transparent' : 'border-white/5'}`}
            >
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-bold text-xl">{plan.name}</h4>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-white">{plan.price}</span>
                    <span className="text-xs text-gray-500">/ {plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2.5">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setSelectedPlan(plan)}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  selectedPlan.name === plan.name
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                {selectedPlan.name === plan.name ? 'Selected Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Form & Payment details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Account Payment details */}
        <div className="lg:col-span-1 bg-[#13131a] border border-white/5 rounded-xl p-5 space-y-6">
          <h3 className="text-white font-semibold">Payment Info</h3>
          {paymentMethods.length === 0 ? (
            <p className="text-gray-500 text-sm">No active payment methods found.</p>
          ) : (
            <div className="space-y-4">
              <label className="text-xs text-gray-500 font-semibold block uppercase">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => setSelectedMethod(m)}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold text-center transition-colors ${
                      selectedMethod?.name === m.name
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                        : 'border-white/5 bg-white/2 text-gray-400 hover:text-white'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>

              {selectedMethod && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                  {selectedMethod.qr_image_url && (
                    <div className="bg-white p-2 rounded-lg w-40 h-40 mx-auto border border-white/10 flex items-center justify-center">
                      <img src={selectedMethod.qr_image_url} alt="Payment QR" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs block">Account Name</span>
                      <span className="text-white font-medium">{selectedMethod.account_name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block">Account/Wallet Number</span>
                      <span className="text-white font-mono font-semibold">{selectedMethod.account_number || '—'}</span>
                    </div>
                    {selectedMethod.description && (
                      <p className="text-xs text-gray-400 mt-2 bg-white/2 p-2 rounded leading-relaxed">
                        {selectedMethod.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submission Form */}
        <div className="lg:col-span-2 bg-[#13131a] border border-white/5 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Submit Payment Request</h3>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1 block">Plan Selected</label>
                <input
                  type="text"
                  disabled
                  value={selectedPlan?.name || ''}
                  className="w-full px-3 py-2.5 bg-white/2 border border-white/5 rounded-lg text-white font-medium text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1 block">Amount Due</label>
                <input
                  type="text"
                  disabled
                  value={selectedPlan?.price || ''}
                  className="w-full px-3 py-2.5 bg-white/2 border border-white/5 rounded-lg text-white font-medium text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1 block">Transaction ID (TxID)</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter unique billing transaction code"
                className="w-full px-3 py-2.5 bg-[#0c0c14] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder-gray-600 font-mono"
              />
            </div>

            {/* Screenshot Upload */}
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1 block">Screenshot of Receipt</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 text-sm font-semibold rounded-lg transition-colors cursor-pointer shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>Choose Image</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                <span className="text-xs text-gray-500 truncate max-w-xs">{fileName || 'No file selected'}</span>
              </div>
            </div>

            {submitError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                {submitSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-600/15"
            >
              {submitting ? 'Submitting Details...' : 'Submit Upgrade Verification'}
            </button>
          </form>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4 pt-4">
        <h3 className="text-white font-semibold text-lg">Transaction History</h3>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 bg-[#13131a] rounded-xl border border-white/5 text-center">No transaction records found.</p>
        ) : (
          <div className="bg-[#13131a] border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2 text-gray-500 font-semibold text-xs uppercase">
                    {['Transaction ID', 'Plan', 'Amount', 'Payment Method', 'Submitted At', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((t, idx) => (
                    <tr key={t.id || idx} className="hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 text-white font-mono text-xs">{t.transaction_id || '—'}</td>
                      <td className="px-4 py-3 text-white font-medium">{t.plan_name || 'Starter'}</td>
                      <td className="px-4 py-3 text-gray-300 font-mono text-xs">NPR {t.amount || 0}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{t.payment_method || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {t.submitted_at ? t.submitted_at.substring(0, 16).replace('T', ' ') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            (t.status || '').toLowerCase() === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : (t.status || '').toLowerCase() === 'rejected'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {t.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
