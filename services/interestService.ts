// services/interestService.ts
export async function sendInterest(receiverId: number): Promise<boolean> {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/interests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ receiver_id: receiverId }),
    });
    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}

export async function recordProfileView(viewedUserId: number): Promise<void> {
  try {
    const token = localStorage.getItem('token');
    await fetch('/api/profile-views', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ viewed_user_id: viewedUserId }),
    });
  } catch {
    // Silently fail — this is non-critical
  }
}
