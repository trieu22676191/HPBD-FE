import React from "react";
import "../styles/WishSection.css";

function WishSection() {
  const handleButtonClick = () => {
    const bubblesSection = document.getElementById("bubbles");
    if (bubblesSection) {
      bubblesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="wish-section" id="wish">
      <div className="wish-container">
        <div className="wish-image-container">
          <div className="wish-image-wrapper">
            <img
              src="https://res.cloudinary.com/dclomtdc3/image/upload/v1764446582/z6645223134802_b450305e2175438f74a28f637ea7235b_sxxxhj.jpg"
              alt="Diệu Hiền"
              className="wish-image"
            />
          </div>
        </div>

        <div className="wish-content">
          <h2 className="wish-header">Con Khỉ gửi con Rùa!</h2>
          <div className="wish-date">19/12/2025</div>
          <div className="wish-message">
            <p>
              Chào cô bé! Hôm nay là một ngày rất đặc biệt — không chỉ vì hôm
              nay là sinh nhật em, mà còn là dịp để anh và những người yêu
              thương em gửi đến em những lời chúc chân thành nhất.
            </p>
            <p>
              Nhân ngày sinh nhật, anh chúc em có một ngày thật rực rỡ, nhiều
              tiếng cười, nhiều niềm vui và những bất ngờ nho nhỏ nhưng đủ làm
              em mỉm cười. Mong rằng tuổi mới sẽ mang đến cho em thêm nhiều trải
              nghiệm hay ho, những điều tốt đẹp, và luôn có những người thân yêu
              ở bên cạnh, trân trọng và yêu thương em đúng như cách em xứng
              đáng.
            </p>
            <p>Happy Birthday to you! 🎉🎂</p>
          </div>
          <button className="wish-button" onClick={handleButtonClick}>
            Rảnh tay thì bấm vào đây
          </button>
        </div>
      </div>
    </section>
  );
}

export default WishSection;
