function Avatar({ photoUrl, emoji = '🙂', size = 40, style = {} }) {
  if (photoUrl) {
    return (
      <img
        src={`http://localhost:5000/api/fichiers${photoUrl.replace('/uploads', '')}?token=${localStorage.getItem('token')}`}
        alt="Avatar"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          ...style,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#E5E9F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.45,
        ...style,
      }}
    >
      {emoji}
    </div>
  );
}

export default Avatar;