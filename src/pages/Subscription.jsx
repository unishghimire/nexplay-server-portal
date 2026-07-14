import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/Dialog'
import { Check, CreditCard, Clock, Calendar, AlertTriangle, Upload, ChevronRight } from 'lucide-react'

const AVAILABLE_PLANS = [
  {
    name: 'Free Trial',
    price: 'NPR 0',
    period: 'forever',
    tournamentLimit: 3,
    description: 'Perfect to try out NexPlay features in your Discord server.',
    features: [
      'Up to 3 Tournaments total',
      'Basic brackets & matchmaking',
      'Discord roles integration',
      'Community support'
    ]
  },
  {
    name: 'Basic',
    price: 'NPR 499',
    period: 'month',
    tournamentLimit: 10,
    description: 'Grow your gaming community with regular tournaments.',
    features: [
      'Up to 10 Tournaments total',
      'Automated match generation',
      'Participant registration forms',
      'Basic analytics dashboard',
      'Priority Discord support'
    ]
  },
  {
    name: 'Pro',
    price: 'NPR 999',
    period: 'month',
    tournamentLimit: Infinity,
    description: 'Unlimited tournaments and premium customization tools.',
    features: [
      'Unlimited Tournaments',
      'Custom role branding & rewards',
      'Full exportable registration sheets',
      'Advanced tournament analytics',
      '24/7 Dedicated account manager',
      'Ad-free portal experience'
    ]
  }
]

export default function Subscription() {
  const { guild, token } = useAuth()
  const [server, setServer] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(false)
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false)
  
  // Upgrade Modal State
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [transactionId, setTransactionId] = useState('')
  const [screenshotBase64, setScreenshotBase64] = useState('')
  const [fileName, setFileName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Fetch initial server status
  const fetchServerStatus = async () => {
    if (!guild || !token) return
    try {
      const data = await api.getServer(guild.id, token)
      if (data && data.server) {
        setServer(data.server)
      }
    } catch (err) {
      console.error('Error fetching server details:', err)
    }
  }

  // Fetch transactions history
  const fetchTransactions = async () => {
    if (!guild || !token) return
    setTxLoading(true)
    try {
      const data = await api.getMyTransactions(guild.id, token)
      setTransactions(data?.transactions || [])
    } catch (err) {
      console.error('Error fetching transactions:', err)
    } finally {
      setTxLoading(false)
    }
  }

  useEffect(() => {
    if (!guild || !token) return
    
    const init = async () => {
      setLoading(true)
      await fetchServerStatus()
      await fetchTransactions()
      setLoading(false)
    }

    init()
  }, [guild, token])

  // Open Upgrade modal and fetch payment methods
  const handleUpgradeClick = async (plan) => {
    setSelectedPlan(plan)
    setSubmitError('')
    setSubmitSuccess(false)
    setTransactionId('')
    setScreenshotBase64('')
    setFileName('')
    setSelectedMethod(null)

    setPaymentMethodsLoading(true)
    try {
      const methods = await api.getPaymentMethods()
      setPaymentMethods(methods || [])
      if (methods && methods.length > 0) {
        setSelectedMethod(methods[0])
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err)
      setSubmitError('Failed to load payment methods. Please try again.')
    } finally {
      setPaymentMethodsLoading(false)
    }
  }

  // Handle screenshot file input & base64 conversion
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onloadend = () => {
      setScreenshotBase64(reader.result)
    }
    reader.onerror = () => {
      setSubmitError('Failed to read file. Please choose another image.')
    }
    reader.readAsDataURL(file)
  }

  // Submit payment upgrade
  const handleSubmitPayment = async (e) => {
    e.preventDefault()
    if (!selectedPlan || !selectedMethod) return
    if (!transactionId.trim()) {
      setSubmitError('Please enter the transaction ID.')
      return
    }
    if (!screenshotBase64) {
      setSubmitError('Please upload a screenshot of the payment receipt.')
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      const amountValue = selectedPlan.name === 'Basic' ? 499 : selectedPlan.name === 'Pro' ? 999 : 0
      
      const payload = {
        guild_id: guild.id,
        guild_name: guild.name,
        plan_name: selectedPlan.name,
        amount: amountValue,
        transaction_id: transactionId,
        screenshot_base64: screenshotBase64,
        payment_method_name: selectedMethod.name
      }

      await api.submitPayment(payload, token)
      setSubmitSuccess(true)
      // Refresh transactions after brief delay
      fetchTransactions()
      fetchServerStatus()
    } catch (err) {
      console.error('Error submitting payment request:', err)
      setSubmitError(err.message || 'An error occurred while submitting payment. Please try again.')
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

  const planName = server?.plan_name || 'Free Trial'
  const subStatus = server?.subscription_status || 'trial'
  const tournamentsUsed = server?.tournaments_used || 0
  const tournamentLimit = server?.tournament_limit || 3
  const renewsAt = server?.renews_at ? server.renews_at.substring(0, 10) : '—'

  // Progress Bar percentage
  const usagePercentage = tournamentLimit === Infinity ? 0 : Math.min(100, (tournamentsUsed / tournamentLimit) * 100)

  // Status Badge styling helper
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge variant="success" className="uppercase tracking-wider">Active</Badge>
      case 'trial':
        return <Badge variant="primary" className="uppercase tracking-wider">Free Trial</Badge>
      case 'expired':
        return <Badge variant="danger" className="uppercase tracking-wider">Expired</Badge>
      default:
        return <Badge variant="warning" className="uppercase tracking-wider">{status || 'Unknown'}</Badge>
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Subscription Plan</h1>
        <p className="text-gray-400 mt-1">Manage your Discord server's plan, upgrade features, and view payment history.</p>
      </div>

      {/* 1. Current Plan Card */}
      <Card className="bg-[#0d0d1a] border-[#1a1a2e] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-semibold tracking-wider uppercase">CURRENT PLAN</span>
              {getStatusBadge(subStatus)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{planName}</h2>
              <div className="flex items-center gap-2 mt-1.5 text-gray-400 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Next Renewal: <strong>{renewsAt}</strong></span>
              </div>
            </div>
          </div>

          {/* Tournament Usage Limit Bar */}
          <div className="w-full md:w-80 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 font-medium">Tournament Usage</span>
              <span className="text-white font-semibold font-mono">
                {tournamentsUsed} / {tournamentLimit === Infinity ? '∞' : tournamentLimit}
              </span>
            </div>
            <div className="w-full bg-[#16162a] h-2.5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${tournamentLimit === Infinity ? 0 : usagePercentage}%` }}
              />
            </div>
            {tournamentLimit !== Infinity && tournamentsUsed >= tournamentLimit && (
              <p className="text-xs text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Usage limit reached. Upgrade to keep hosting tournaments.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* 2. Available Plans Grid */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Available Premium Plans</h3>
          <p className="text-gray-400 text-sm">Unlock more capabilities and host tournaments without restrictions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AVAILABLE_PLANS.map((plan) => {
            const isCurrent = planName.toLowerCase() === plan.name.toLowerCase()
            return (
              <Card 
                key={plan.name} 
                className={`bg-[#0d0d1a] border-[#1a1a2e] flex flex-col justify-between p-6 relative overflow-hidden ${
                  isCurrent ? 'ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/10' : ''
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-bl-lg">
                    Current
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 min-h-[32px]">{plan.description}</p>
                  
                  <div className="mt-4 mb-6">
                    <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-gray-400 text-sm"> / {plan.period}</span>
                  </div>

                  <hr className="border-white/5 my-4" />

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant={isCurrent ? 'outline' : 'default'}
                  className="w-full font-semibold"
                  disabled={isCurrent || plan.name === 'Free Trial'}
                  onClick={() => handleUpgradeClick(plan)}
                >
                  {isCurrent ? 'Your Current Plan' : plan.name === 'Free Trial' ? 'Unavailable' : 'Upgrade Now'}
                </Button>
              </Card>
            )
          })}
        </div>
      </div>

      {/* 4. Transaction History Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Transaction History</h3>
            <p className="text-gray-400 text-sm">Review your past payment upgrade records and status updates.</p>
          </div>
          {txLoading && <div className="w-4 h-4 border border-indigo-500 border-t-transparent rounded-full animate-spin" />}
        </div>

        <Card className="bg-[#0d0d1a] border-[#1a1a2e] overflow-hidden">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No transactions found</p>
              <p className="text-gray-600 text-xs mt-1">Upgrade your plan above to submit your first payment receipt.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">TX ID</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                  {transactions.map((tx) => (
                    <tr key={tx.id || tx.transaction_id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                        {tx.created_date ? tx.created_date.substring(0, 10) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{tx.plan_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-white font-semibold">NPR {tx.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-xs">{tx.payment_method_name || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-400 select-all" title={tx.transaction_id}>
                        {tx.transaction_id ? (tx.transaction_id.length > 15 ? `${tx.transaction_id.substring(0, 15)}...` : tx.transaction_id) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={
                            tx.status === 'completed' || tx.status === 'approved' ? 'success' :
                            tx.status === 'pending' ? 'warning' : 'danger'
                          }
                          className="capitalize text-[11px]"
                        >
                          {tx.status || 'pending'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* 3. Payment Upload Modal (Dialog) */}
      <Dialog isOpen={!!selectedPlan} onClose={() => setSelectedPlan(null)} className="max-w-xl bg-[#0d0d1a] border-[#1a1a2e]">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Upgrade to {selectedPlan?.name}</DialogTitle>
          <DialogDescription className="text-gray-400 text-xs">
            Confirm your choice and complete the payment process below.
          </DialogDescription>
        </DialogHeader>

        {submitSuccess ? (
          <div className="space-y-6 text-center py-6">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Payment Submitted Successfully!</h4>
              <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">
                Our support team is verifying your transaction. It usually takes less than 24 hours to active your plan.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setSelectedPlan(null)} variant="default" className="w-full sm:w-auto">
                Got it
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmitPayment} className="space-y-5">
            {/* Plan Info Card */}
            <div className="flex justify-between items-center bg-[#131326] p-4 rounded-lg border border-white/5">
              <div>
                <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">SELECTED PLAN</span>
                <p className="text-base font-bold text-white mt-0.5">{selectedPlan?.name}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 uppercase">PRICE</span>
                <p className="text-lg font-extrabold text-white mt-0.5">{selectedPlan?.price}</p>
              </div>
            </div>

            {/* Payment Methods Section */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Payment Methods</label>
              
              {paymentMethodsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : paymentMethods.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4 bg-white/2 rounded-lg">No payment methods configured.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {paymentMethods.map((method) => {
                    const isSelected = selectedMethod?.name === method.name
                    return (
                      <button
                        key={method.name}
                        type="button"
                        onClick={() => setSelectedMethod(method)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          isSelected 
                            ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-md' 
                            : 'bg-white/2 border-white/5 text-gray-400 hover:bg-white/5 hover:text-gray-300'
                        }`}
                      >
                        <p className="text-sm font-bold truncate">{method.name}</p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* QR and Account Info */}
            {selectedMethod && (
              <div className="bg-[#131326] p-4 rounded-lg border border-white/5 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                  {selectedMethod.qr_image_url && (
                    <img 
                      src={selectedMethod.qr_image_url} 
                      alt={`${selectedMethod.name} QR Code`} 
                      className="w-32 h-32 object-contain bg-white p-1 rounded-md shrink-0 border border-white/10" 
                    />
                  )}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <h5 className="font-bold text-white text-sm">{selectedMethod.name} Account</h5>
                    <p className="text-xs text-gray-300 bg-white/2 p-2.5 rounded border border-white/5 font-mono select-all break-all whitespace-pre-wrap">
                      {selectedMethod.details || selectedMethod.account_number || 'Details unavailable'}
                    </p>
                    <p className="text-[11px] text-gray-500">Scan the QR code or send payment to the details above.</p>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload Input & Text Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Screenshot of Receipt</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex h-10 w-full items-center justify-between rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-sm text-gray-400 hover:bg-white/3">
                    <span className="truncate max-w-[150px]">{fileName || 'Choose image'}</span>
                    <Upload className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Transaction ID / Reference</label>
                <Input
                  type="text"
                  placeholder="e.g. TXN10023405"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="bg-[#1a1a24]"
                />
              </div>
            </div>

            {submitError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-rose-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <DialogFooter className="sm:space-x-3 mt-6 border-t border-white/5 pt-4">
              <Button type="button" variant="outline" onClick={() => setSelectedPlan(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" isLoading={submitting} disabled={submitting || !selectedMethod}>
                Submit Payment Verification
              </Button>
            </DialogFooter>
          </form>
        )}
      </Dialog>
    </div>
  )
}
