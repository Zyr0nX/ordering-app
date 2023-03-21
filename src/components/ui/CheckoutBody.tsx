import CommonButton from "../common/CommonButton";
import {
  type User,
  type CartItem,
  type Food,
  type FoodOptionItem,
  type Restaurant,
} from "@prisma/client";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

const CheckoutBody = ({
  user,
}: {
  user: User & {
    cartItem: (CartItem & {
      food: Food & {
        restaurant: Restaurant;
      };
      foodOption: FoodOptionItem[];
    })[];
  };
}) => {
  const restaurant = user.cartItem[0]?.food.restaurant;

  const total = user.cartItem.reduce(
    (acc, item) => acc + item.food.price * item.quantity,
    0
  );

  const router = useRouter();

  const strapiMutation = api.stripe.createCheckoutSession.useMutation();

  const handleCheckout = async () => {
    localStorage.setItem("cart", JSON.stringify(user.cartItem));
    const { checkoutUrl } = await strapiMutation.mutateAsync({
      items: user.cartItem.map((item) => ({
        id: item.foodId,
        name: item.food.name,
        description: item.foodOption.map((option) => option.name).join(", "),
        image: item.food.image,
        amount: item.quantity,
        quantity: item.quantity,
        price:
          item.food.price +
          item.foodOption.reduce((acc, item) => acc + item.price, 0),
      })),
      restaurantId: restaurant?.id as string,
      deliveryAddress: user.address || "",
    });
    if (checkoutUrl) {
      void router.push(checkoutUrl);
    }
  };
  return (
    <div className="m-4 flex flex-col gap-4 text-virparyasMainBlue">
      <div className="rounded-2xl bg-white p-4 shadow-md">
        <p>Shipping address</p>
        <p>John Doe</p>
        <p>123 45th Street</p>
        <p>Philadelphia, PA 19104</p>
        <p>123-456-789</p>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-md">
        <div className="flex flex-col gap-2">
          <div>
            <p>Review Your Order</p>
            <p>{restaurant?.name}</p>
            <p>{restaurant?.address}</p>
          </div>
          <div className="h-0.5 w-full bg-virparyasBackground" />
          <ul className="flex list-decimal flex-col gap-2">
            {user.cartItem.map((cardItem) => (
              <li className="marker:text-sm marker:font-bold" key={cardItem.id}>
                <div className="flex justify-between font-bold">
                  <p>{cardItem.food.name}</p>
                  <p>
                    $
                    {(
                      (cardItem.food.price +
                        cardItem.foodOption.reduce(
                          (acc, item) => acc + item.price,
                          0
                        )) *
                      cardItem.quantity
                    ).toFixed(2)}
                  </p>
                </div>

                <p className="my-1 text-sm font-light">
                  {cardItem.foodOption.map((option) => option.name).join(", ")}
                </p>
              </li>
            ))}
          </ul>
          <div className="h-0.5 w-full bg-virparyasBackground" />
          <div>
            <div className="flex justify-between">
              <p>Items:</p>
              <p>${total}</p>
            </div>
            <div className="flex justify-between">
              <p>Shipping:</p>
              <p>$5.00</p>
            </div>
          </div>
          <div className="h-0.5 w-full bg-virparyasBackground" />
          <div className="flex justify-between">
            <p>Total:</p>
            <p>$TODO</p>
          </div>
        </div>
      </div>
      <CommonButton
        text="Proceed to Payment - $TODO"
        onClick={() => void handleCheckout()}
      ></CommonButton>
    </div>
  );
};

export default CheckoutBody;
