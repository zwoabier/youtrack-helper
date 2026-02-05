import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
const priorityColors = {
    Critical: 'text-red-400',
    High: 'text-orange-400',
    Medium: 'text-yellow-400',
    Low: 'text-green-400',
    '': 'text-slate-400',
};
export function TicketItem({ ticket, isSelected, onSelect }) {
    return (_jsxs("div", { onClick: onSelect, className: clsx('px-4 py-3 cursor-pointer transition-colors', isSelected ? 'bg-slate-800' : 'hover:bg-slate-900'), children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("span", { className: "font-bold text-cyan-400 min-w-fit", children: ticket.id }), _jsx("span", { className: "text-white flex-1 truncate", children: ticket.summary }), _jsx("span", { className: clsx('font-medium text-sm', priorityColors[ticket.priority] || priorityColors['']), children: ticket.priority || '-' })] }), _jsxs("div", { className: "flex items-center gap-3 text-slate-400 text-sm", children: [_jsx("span", { className: "min-w-fit", children: ticket.type || 'Unknown' }), _jsx("div", { className: "flex-1" }), ticket.sprints && ticket.sprints.length > 0 && (_jsx("div", { className: "flex gap-2", children: ticket.sprints.map((sprint) => (_jsx("span", { className: "px-2 py-1 border border-slate-600 rounded-full text-xs", children: sprint }, sprint))) }))] })] }));
}
