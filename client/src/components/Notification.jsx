// import React, { useState } from "react";
// import { Bell } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// const Notifications = () => {
//   const [open, setOpen] = useState(false);

//   const dummyNotifications = [
//     "Alex started following you",
//     "Your post got a new like",
//     "Riya commented on your post",
//   ];

//   return (
//     <div className="relative">
//       <button onClick={() => setOpen((prev) => !prev)}>
//         <Bell />
//       </button>

//       <AnimatePresence>
//         {open && (
//           <motion.div
//             className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-4 z-50"
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//           >
//             <h4 className="font-bold mb-2">Notifications</h4>
//             <ul className="space-y-2 text-sm">
//               {dummyNotifications.map((note, i) => (
//                 <li key={i} className="border-b pb-1">{note}</li>
//               ))}
//             </ul>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default Notifications;
