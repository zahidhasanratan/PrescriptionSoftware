import React from "react";
import { Zoom } from "react-awesome-reveal";

export const GardenerOfMonth = () => {
  return (
    <section className="py-20 bg-base-200">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <Zoom triggerOnce>
          <h2 className="text-3xl font-bold text-primary mb-6">
            🌟 Gardener of the Month
          </h2>
        </Zoom>

        <Zoom delay={100} triggerOnce>
          <div className="bg-base-100 p-6 rounded-lg shadow-md flex flex-col md:flex-row items-center gap-6">
            <img
              src="https://i.ibb.co/3mLK9HW9/rita-malcok-o-Oh-TXx5m-Jq-I-unsplash.jpg"
              className="w-32 h-32 rounded-full border-4 border-primary"
              alt="Gardener of the Month - Monica Leaf"
            />
            <div className="text-left">
              <h3 className="text-xl font-bold text-primary">Monica Leaf</h3>
              <p className="text-secondary font-medium mb-2">
                Medicinal Herb Specialist
              </p>
              <p className="text-muted text-sm">
                Monica turned her urban backyard into a thriving herbal
                sanctuary. She educates others on sustainable gardening and the
                benefits of native medicinal plants for health and wellness.
              </p>
            </div>
          </div>
        </Zoom>
      </div>
    </section>
  );
};
